# API Documentation

> This is a demo project for portfolio purposes.
>  It is **not intended for production use**.

> Some security-related fields are intentionally exposed to demonstrate
> authentication flows, token invalidation logic, and internal state changes.
>
> Since this project is for practice only, CORS and certain production-level
> security configurations are intentionally omitted.

本專案為練習用作品集，主要目的是展示後端認證與授權的設計思路與實作方式，
並非實際上線產品，因此部分正式環境才會啟用的安全設定（如 CORS）刻意省略。

---

## Server Check

Request:
GET `/`

Response:

```json
{
  "message": "server is running."
}
```

## 帳號相關

---

### 註冊

基本上預設前端或做 checkPassword 比對，傳到後端只有 password 欄位

Request
POST `/user/register`

```json
{
  "name": "user5@example.com",
  "email": "user5@example.com",
  "password": "12345"
}
```

Response

```json
{
  "message": "Registered success!",
  "safeUser": {
    "id": 7,
    "name": "user5",
    "email": "user5@example.com",
    "securityStamp": "61deb639-25af-4401-8c83-73c1db759c2e",
    "createdAt": "2026-02-09T11:15:00.787Z",
    "updatedAt": "2026-02-09T11:15:00.787Z"
  }
}
```

> Note:
> `securityStamp` is exposed here **for demonstration purposes only**, to show
> how token invalidation and credential state changes are handled internally.
> In a production system, this field would not be returned.

> 註：`securityStamp` 僅用於展示 token 失效與帳號安全狀態變化的設計概念，
> 實際上線環境不會將此欄位回傳給前端。

---

此專案刻意同時實作 Session 與 JWT 兩種登入流程，
用來比較不同認證策略在實作與維護上的差異。

### 登入

This project demonstrates a **hybrid authentication design**, supporting both:

* Session-based authentication (cookie-based)
* JWT-based authentication (access token + refresh token)

The login behavior is determined by the `authStrategy` field in the request body.

因為登入設計成可以支援 session cookie 登入和 jwt 登入，靠 json 的 `authStrategy` 分別為 `"session"` 還是 `"jwt"` 來決定走 session 登入流程還是發 jwt token

POST `/auth/login`

```
authStrategy: "session" | "jwt"
```

#### Session 登入
Request POST `/auth/login`

```json
{
  "email": "user1@example.com",
  "password": "12345",
  "authStrategy": "session"
}
```

Response

```json
{
  "user": {
    "id": 1,
    "name": "user1",
    "email": "user1@example.com"
  },
  "authType": "session"
}
```
and session cookie `sid`

JWT 登入
Request POST `/auth/login`

```json
{
  "email": "user1@example.com",
  "password": "12345",
  "authStrategy": "jwt"
}
```

Response

```json
{
  "user": {
    "id": 1,
    "name": "user1",
    "email": "user1@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### google OAuth

This project includes a simple static HTML page to simulate
the Google OAuth login flow.

此頁面僅為靜態 HTML，用來模擬 OAuth 流程與 redirect 行為，
並非實際產品前端實作。
使用靜態網頁模擬 google OAuth 過程
Test page
`http://localhost:5000/oauth/google-oauth-test.html`

Click the login button to initiate the OAuth flow.
After successful authentication, the browser will be redirected
to a login success page.

點擊按鈕後，登入成功會轉到登入成功頁面

> This implementation is intended to demonstrate OAuth integration logic,
> not a full production-ready OAuth frontend.


### 登出 logout
POST `/auth/logout`
#### JWT logout
If the request body contains a `refreshToken`,
the backend will treat the request as a JWT logout and:

* Revoke the corresponding refresh token in the database
* Invalidate the token for that specific device/session

在 request 帶有 refreshToken 就會執行 JWT 登出，並把該裝置的 refreshToken 在後端資料庫註銷

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
Response: http 204

#### session logout

If no `refreshToken` is provided, the backend will check for
a valid session cookie (`sid`).

If a session exists, the server will destroy the session.

如果在 `/auth/logout` 沒有在 request json 放 refreshToken ，那後端會檢查 request 是否有 sid cookie ，如果有就執行 session logout

Response: HTTP `204 No Content`


---

### 查看帳號資料

Retrieve the authenticated user's profile.

Request
GET `/user/profile/`
在 Request headers 需要在放入有效的 accessToken

```
Authorization: Bearer <accessToken>
```
或是有效的 session `sid` cookie

* JWT Bearer access token

  ```
  Authorization: Bearer <accessToken>
  ```
* or a valid session cookie (`sid`)

Response
```json
{
    "id": 1,
    "name": "user1",
    "email": "user1@example.com",
    "securityStamp": "5a398e66-377e-4370-b728-3dbe2976fe27",
    "createdAt": "2026-01-28T15:19:28.067Z",
    "updatedAt": "2026-01-28T15:19:28.067Z"
}
```

---

> Note:
> The `securityStamp` field is included here to help visualize how authentication
> state changes propagate through the system.
> In a production environment, this field would not be exposed.

## Design Summary 設計概要

The following section summarizes the core authentication design decisions
demonstrated in this project.

This project demonstrates a hybrid authentication architecture that supports:

* Session-based authentication (cookie + server-side session storage)
* JWT-based authentication with access/refresh token rotation
* Per-device refresh token revocation
* Use a securityStamp mechanism that, when an account's state changes, the backend revokes all old state tokens and sessions.
* OAuth login integration (Google OAuth demo)

The primary goal of this project is to showcase authentication design,
trade-offs, and implementation details rather than production deployment.

以下為本專案中身分驗證系統的核心設計摘要。

專案展示了一種混合式身分驗證架構，支援：

* 基於 session 的身份驗證（Cookie + 伺服器端 session 儲存）
* 基於 JWT 的身份驗證，支援存取 access token/refresh token 的發放與輪替
* 基於裝置的 refresh token 撤銷
* 使用 securityStamp 機制，當帳號狀態改變時，後端可撤銷所有舊有狀態的 token 與 session
* OAuth 登入整合（Google OAuth 演示）
本專案的主要目標是展示身份驗證設計、

權衡取捨和實現細節，而非生產部署。