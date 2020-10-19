#include "QueryParser.h"
#include "log.h"

namespace caxios {

  std::map < std::string, std::function < std::shared_ptr<caxios::IExpression>(const nlohmann::json&) > > IExpression::m_Creator;
  std::shared_ptr<caxios::IExpression> IExpression::Build(const std::string& s, const nlohmann::json& v)
  {
    if (m_Creator.size() == 0) {
      m_Creator["$lt"] = [](const std::string& v) ->std::shared_ptr<caxios::IExpression> {
        std::shared_ptr<caxios::IExpression> ptr(new caxios::JsonOperator("$lt", v, LessThan));
        return ptr;
      };
    }
    if (s.empty()) {
      return std::shared_ptr<caxios::IExpression>(new caxios::JsonTerminate());
    }
    auto itr = m_Creator.find(s);
    if (itr == m_Creator.end()) {
      std::shared_ptr<caxios::IExpression> ptr(new caxios::JsonOperator(s, v, Equal));
      return ptr;
    }
    return m_Creator[s](v);
  }


  QueryParser::QueryParser()
  {
  }

  QueryParser::~QueryParser()
  {
    if (_ast) {
      delete _ast;
      _ast = nullptr;
    }
  }

  bool QueryParser::Parse(const nlohmann::json& query)
  {
    if (_ast) {
      delete _ast;
    }
    _ast = new AST();
    _ast->Parse(query);
    return true;
  }

  void QueryParser::Travel(std::function<void(IExpression* pExpression)> visitor)
  {

  }

  AST::~AST()
  {
  }

  void AST::travel(std::function<void(IExpression* pExpression)> visitor)
  {

  }

  void AST::Parse(const nlohmann::json& query)
  {
    T_LOG("Parse: %s", query.dump().c_str());
    if (query.size() > 1) { // and ����
      for (auto itr = query.begin(); itr != query.end(); ++itr) {
        std::string k = itr.key();
        nlohmann::json v = itr.value();
        auto expression = IExpression::Build(k, v);
      }
      return;
    }
    for (auto itr = query.begin(); itr != query.end(); ++itr) {
      std::string k = itr.key();
      nlohmann::json v = itr.value();
      _pExpression = IExpression::Build(k, v);
    }
  }

  JsonKey::JsonKey(const std::string& k)
    :IStatement(k)
  {

  }

  JsonOperator::JsonOperator(const std::string& key, const nlohmann::json& v, EOperator op)
    :IExpression(key), _op(op)
  {
    if (v.is_object()) {
      for (auto itr = v.begin(); itr != v.end(); ++itr) {
        std::string k = itr.key();
        std::string val = itr.value();
        _children.emplace_back(Build(k, val));
      }
    }
  }

  }