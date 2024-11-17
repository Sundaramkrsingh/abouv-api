# API Endpoint

> These will give an idea of what endpoints are required for a module. While implementation the signature and/or method may change

## Auth

```
[POST]  /auth/otp/send
[POST]  /auth/otp/resend
[POST]  /auth/otp/verify
[POST]  /auth/login
[GET]   /auth/logout
[POST]  /auth/refresh-token
[GET]   /auth/me
```

## Questions

```
[GET/POST]  /questions
[GET]       /questions/total-questions
[GET/PATCH/DELETE]  /questions/{questionId}
[PATCH]             /questions/{questionId}/isActive

[GET/POST] /questions/{userId}/preq
[GET/POST] /questions/{userId}/inq
[GET/POST] /questions/{userId}/postq
```
