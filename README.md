# BACKEND - PICKING-APP

## Variáveis de Ambiente

Exemplo de variáveis de ambiente para desenvolvimento:

```bash
NODE_ENV                            = "development"
TZ                                  = "America/Sao_Paulo"
HOST                                = "http://localhost"
PORT                                = 8888
HOST_URL                            = "http://localhost:8888"
DB_MONGO_URI                        = "mongodb://localhost:27017/picking-api"
JWT_SECRET                          = "secret"
JWT_ACCESS_EXPIRATION_SECS          = 900 # 15m
JWT_REFRESH_EXPIRATION_SECS         = 604800 # 7d
JWT_RESET_PASSWORD_EXPIRATION_SECS  = 3600 # 1h
BCRYPT_COST                         = 10
MAILER_HOST                         = "sandbox.smtp.mailer.io" # try 'mailtrap' for dev
MAILER_PORT                         = 2525
MAILER_USERNAME                     = "mailer_username"
MAILER_PASSWORD                     = "mailer_password"
NO_REPLY_EMAIL                      = "no-replay@pickingapp.com.br"
TEST_HOST                           = "http://localhost"
TEST_DB_MONGO_URI                   = "mongodb://localhost:27017/picking-api-test"
TEST_SHOPIFY_STORE_TOKEN            = "shopify_store_token_here" # from real test/dev store
TEST_SHOPIFY_API_SECRET             = "shopify_api_secret_here" # from real test/dev store
TEST_SHOPIFY_API_KEY                = "shopify_api_key_here" # from real test/dev store
```
