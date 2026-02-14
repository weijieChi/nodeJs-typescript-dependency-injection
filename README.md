# 使用 typescript 與 Dependency Injection 架構的，跟各種帳號認證的練習專案
TypeScript + Dependency Injection + Multi-Auth Architecture

This is a backend-only Node.js practice project built with TypeScript and a Dependency Injection (DI) architecture, focusing on the design and implementation of multiple authentication strategies and login state management.

---

# 概述

該專案是 **純後端練習專案** ，主要是我在嘗試整合多種後端技術跟設計模式的結果。
因為該專案是概念驗證練習專案，所以在 API 部分並未處理 CORS 跨網域資源共享。
這是我想嘗試在 Node.js 使用 Typescript 開發，並嘗試使用不同於之前專案 MVC 架構，使用 **DI (Dependency Injection)** ， 來組織專案模組之間的依賴關係，以降低耦合度，並提升未來擴充與修改的彈性。相較於過往 MVC 專案，本專案著重於：

- 明確的模組邊界
- 降低元件之間的耦合
- 提升登入機制與認證流程的可擴充性與可控性

在帳號認證設計方面，嘗試在不使用 passport 套件，而是嘗試手動實作多種認證流程，  
並透過資料庫紀錄登入狀態，以支援：

- 多裝置同時登入
- 後端可撤銷單一裝置的登入狀態
- 後端可撤銷所有登入狀態

Google OAuth 則是改用官方 SDK (`google-auth-library`)不使用 Passport 的 OAuth 功能。
OAuth 驗證成功後，不直接使用 Google 所簽發的 access token， 而是接入專案內部的 JWT 系統，以統一登入狀態與權限管理方式。

將資料庫從之前熟悉的 MySQL 改為 PostgreSQL ，並並為了提升型別安全性將 ORM 換成 Prisma ，使資料操作時可直接使用 Prisma 產生的 model types。

此外，專案中使用 Winston 作為 logger，用於記錄 request 資訊以及應用程式執行過程中產生的錯誤與狀態資訊。

## 專案架構設計
專案架構設計可以參考這份 [專案架構文件](./architecture-overview.md)

## Logging 與錯誤處理

- 使用 Winston 作為 application logger
- 記錄 request 資訊、應用程式執行狀態與錯誤資訊
- 設有全域 request error handler 與 server 啟動層級的錯誤處理機制

# 主要功能

- 帳號功能
  - 帳號註冊
  - 帳號登入(Session / JWT / OAuth)
  - 帳號登出(Session / JWT)
  - 登入狀態驗證 middleware (Session / JWT)
- 瀏覽使用者帳號基本資料

# 使用技術

- Node.js
- PostgreSQL
- Typescript
- Zod (runtime type schema validation)
- tsx (TypeScript development runtime)
- google-auth-library
- morgan (request logging)
- winston (application logger)
- express

# 環境需求

- Git
- Node.js: v24.11.1
- PostgreSQL Server

**Windows 執行環境注意事項⚠**
在 Windows 環境下，請避免專案路徑中包含空白或非 ASCII 字元，例如：

- ❌ `C:\alpha camp\my folder`
- ❌ `C:\Users\吳柏毅\dev`

# 操作步驟

1. 從 github 使用 ssh 下載並進入專案資料夾，並安裝所需套件

```sh
git clone git@github.com:weijieChi/node-auth-from-scratch.git
cd ./node-auth-from-scratch
npm install
```

2. 新增 `.env` 環境變數檔案在根目錄
   設定所需的環境變數，內容可參考 `.env.example` 這個檔案的內容
   包含：

- 各套件所需的 secret string
- PostgreSQL 連線字串
- Google OAuth Client ID

3. 建立資料表與初始資料（Prisma）

```sh
npm run prisma:migrate
npm run prisma:seed
```

4. 啟動開發伺服器

```sh
npm run dev
```

5. 其他功能

```sh
# typescript 專案檔案型別檢查，（不產生編譯檔）
npm run typecheck

# typescript 編譯成 javascript ，（輸出至 ./dist）
npm run build

# 啟動編譯後的 Node.js 應用程式
npm run start

# Prisma Studio
npm run prisma:studio
```

## 測試帳號

1. 
   * email: user1@example.com
   * password: 12345
2. 
   * email: user2@example.com
   * password: 12345
3. 
   * email: user3@example.com
   * password: 12345

# API 使用

本專案的 API 使用方式請參考專案內的 API 使用方式在專案的 [API 說明文件](./api-document.md)。

# 專案架構設計理念

本專案嘗試以 Dependency Injection 的方式設計專案結構，將資料存取、業務邏輯與應用層流程分離，以降低模組之間的耦合關係，並提升程式碼的可維護性。

整體結構大致依循以下責任分層概念：

- Repository：負責資料庫存取（Prisma ORM）
- Service：負責業務邏輯與流程控制
- DI / Container：負責建立與組裝各服務實體
- Router / Controller：負責接收請求並呼叫對應服務

此專案亦包含全域的 request error handler，以及在 server 啟動層級的錯誤處理機制，以確保非預期錯誤能被適當記錄與回應。

# 架構設計

本專案程式模組使用 ES Module ，並使用 ESLint 和 typescript.config.ts 在設定做嚴格個程式碼檢查，最後使用 prettier 對全專案程式碼做風格檢查。

在 Node.js 入口程式碼拆分成 `app.ts` 在 import 到 `server.ts` 上。
伺服器啟動在 `server.ts` 伺服器啟動與全域錯誤處理。
在主要 middleware 和應用程式層，有使用 winston 紀錄各主要 log ，將日誌儲存於 `logs/` 當中。

此設計有助於單元測試與 server-level 錯誤控管。

## 資料實體

因為採用資料庫儲存各認證系統的登入狀態，所以資料實體有以下這些：

- 使用者帳號資料
- session 登入帳號資料，舊的手寫的 session 登入資料表，包含登入當下的 securityStamp Snapshot
- passport-local express-session 的登入資料，包含登入當下的 securityStamp Snapshot
- JWT refresh token 資料，包含登入當下的 securityStamp Snapshot
- OAuth 登入資料，只記錄有使用 OAuth 登入的使用者資料，會關聯到使用者帳號資料

## 業務邏輯

分為 **使用者資料** 和 **認證資料** 兩個業務邏輯

### 使用者資料

包含 name, email, securityStamp(當使用者帳號改變的時候會改變), password(bcryptjs hash)。為支援僅使用 OAuth 登入的使用者，password 欄位允許為 null。

### 登入狀態資料表

所有登入狀態都會用資料庫紀錄，除了 OAuth 資料表以外，都會有 securityStamp Snapshot ，來支援登入狀態撤銷。

#### Session 資料表

cookie: sid 資料(隨機)作為識別，並關聯到 userId 。

#### JWT 資料表

只登記 refresh toke 的資料，還有 jti 可以單裝置識別跟登出和後端 revoked ，可以改變單個 token 的可用狀態

#### OAuthAccount 資料表

紀錄有使用 OAuth 登入的使用者資料，會依據 email 關聯到使用者資料表(登入時候應用層處理)，還有使用哪家的 OAuth 登入，若系統中尚無帳號，則於登入流程中自動建立。

## 註冊邏輯

API 基本上就收三個欄位， name, email, password 。 password 預設前端會做 password 和 checkPassword 比對，所以後端僅負責接收與儲存。

## 登入邏輯

因為之前跟 ChapGPT 討論，被說不要把登入邏輯暴露在路由的 parameter ，在後端依據輸入資料內部邏輯選用登入邏輯，後來考慮之後，選擇在登入的 JSON 新增 `authStrategy` 該欄位，以字串 `session` | `jwt` 由後端選擇登入邏輯。

## 登入邏輯

依據 request headers 內容選擇驗證邏輯，在 headers 有 JWT access toke `Authorization: Bearer <accessToken>` 會優先走 JWT 驗證流程，注意，因為 access toke 有效時間很短，在這裡預設前端當 access toke 驗證部通過時候，會使用 refresh toke 跟後端拿新的 access toke 重新驗證。

## 登入狀態驗證 middleware

後端會依據 request headers 自動選擇驗證流程：

- 若存在 Authorization: Bearer <accessToken>，優先進行 JWT 驗證
- 若 JWT 驗證失敗且 access token 過期，預期由前端使用 refresh token 取得新 access token
- 若 request 中不存在 JWT，則嘗試使用 cookie 中的 sid 進行 session 驗證

當以上流程皆無法通過驗證時，回傳登入驗證失敗的結果。

## 登出流程

當使用 POST `/auth/logout` 會依據 request JSON 是否帶有 refresh toke 還是在 header 有 sid cookie ，後端會選擇使用 JWT 登出或是 Session 登出流程，當 request 都沒有以上的資料，或是驗證資料沒有通過，會返回驗證失敗的訊息。

## 使用帳號資料

GET `/user/profile/`
用於測試登入狀態驗證結果。
當通過驗證 middleware 時，回傳使用者帳號資料；否則回傳驗證失敗訊息。
前端可依回傳結果決定後續導向行為。

## Node.js 程式入口設計

本專案將原本的 Node.js 程式入口分成 `app.ts` 和 `server.ts` 兩個檔案，非單一 app.ts 檔案

# Passport 使用經驗（補充）


在這份專案可以看到以下：
`src/auth/repositories/old.session.repository.ts`
`src/auth/controllers/old.auth.session.controller.ts`
`src/auth/services/old.session.service.ts`
這三個檔案，這是當初嘗試使用手寫 Session 使用資料庫紀錄驗證方式時候留下的檔案。

之後想將 Session 驗證方式切換回 passport-local + express-session ，在實作過程中發現 Passport 需要透過 app-level side effects 註冊 Strategy，並對 request 物件進行型別擴充，增加了重構與維護成本。這種使用方式與本專案的 DI 架構不相容，需要做許多的 workaround 做法，且其 type 定義檔陳舊，與 typescript-ESLint 語法檢查有所衝突 需要建立 `src/types/express.d.ts` 去補充 Passport 建的了 request 內部物件的型別。
在最後要將 Passport-local 的 session 認證寫入資料庫的階段，還需要使用其他套件對 express-session 資料做處理才能寫入資料庫。

就使用經驗而言， Passport 在 DI 架構整合的過程中，Passport 需要透過 app-level side effects 註冊 Strategy，並對 request 物件進行型別擴充，增加了重構與維護成本。

# 最後心得
透過本專案實作 Clean Architecture 與 Dependency Injection 架構後，更加體會到專案前期規劃的重要性。
Dependency Injection 本身僅負責元件之間的組裝方式，並不會自動定義業務邏輯的邊界。若系統在初期未清楚界定核心業務與主要 Use Cases，即使採用 DI 架構，仍可能在實作過程中出現 service 或 controller 的責任模糊，甚至被不同業務共用的情況。
本次專案的實作經驗讓我理解到，前期規劃的核心價值不在於預先定義所有細節，而是在於先建立清楚的業務邊界與演化方向，使架構能隨著功能增加而持續調整，而非在後期被迫重構。