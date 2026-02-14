# 🏗 系統架構說明（Architecture Overview）

## 一、設計理念

本專案採用 **Clean Architecture + Dependency Injection（依賴注入）** 設計原則建構。

核心目標：

* 清楚的關注點分離（Separation of Concerns）
* 提升可測試性
* 降低模組耦合
* 讓基礎設施層可替換
* 明確的驗證與授權邊界

本專案並非將所有邏輯集中於 Express 應用程式中，而是透過分層設計，使業務邏輯與框架解耦。

---

## 二、整體架構分層

```
┌────────────────────────────┐
│        表現層              │
│  (Routes / Controllers)    │
└──────────────┬─────────────┘
               │
┌──────────────▼─────────────┐
│        應用層              │
│   (Services / Use Cases)   │
└──────────────┬─────────────┘
               │
┌──────────────▼─────────────┐
│        領域層              │
│ (Interfaces / Entities)    │
└──────────────┬─────────────┘
               │
┌──────────────▼─────────────┐
│      基礎設施層            │
│ (Prisma / Session / JWT)   │
└────────────────────────────┘
```

---

## 三、各層責任說明

### 1️⃣ 表現層（Presentation Layer）

目錄位置：

```
src/auth/controllers/
src/auth/routes/
```

負責：

* 接收與處理 HTTP 請求
* 基本輸入驗證
* 呼叫應用層服務
* 回傳標準化 API 回應

此層不包含業務邏輯。

---

### 2️⃣ 應用層（Application Layer）

目錄位置：

```
src/auth/services/
```

負責：

* 業務邏輯處理
* 登入驗證流程
* Token 發行與驗證
* Session 與 JWT 協調
* OAuth 登入流程整合

此層僅依賴介面（interface），不直接依賴資料庫或框架。

---

### 3️⃣ 領域層（Domain Layer）

目錄位置：

```
src/auth/repositories/
```

定義：

* Repository 介面
* 核心資料存取抽象
* 驗證相關契約

此層不包含任何 Prisma 或 Express 相關程式碼。

---

### 4️⃣ 基礎設施層（Infrastructure Layer）

目錄位置：

```
src/libs/
src/auth/jwt/
src/auth/oauth/
```

負責：

* Prisma 實作
* Express Session 儲存
* JWT 簽發與驗證
* Google OAuth 串接

此層實作領域層定義的介面。

---

# 🔐 驗證系統設計

本專案採用 **Hybrid Authentication（混合式驗證架構）**。

## 為何使用混合式設計？

不同驗證機制適用不同場景：

| 驗證方式          | 使用場景        |
| ----------------- | --------------- |
| Session           | 傳統瀏覽器登入  |
| JWT Access Token  | API 呼叫        |
| JWT Refresh Token | Token 續期      |
| securityStamp     | 全域失效控制    |
| jti               | 單一 Token 撤銷 |

---

## 登入流程

1. 使用者輸入帳密登入
2. 系統：

   * 建立 Session
   * 發行 Access Token
   * 發行 Refresh Token
3. Token 資訊寫入資料庫

---

## 存取驗證流程

中介層：

```
ensureAuth()
```

流程：

1. 優先檢查 Session
2. 若無 Session 則驗證 JWT
3. 驗證內容包含：

   * 簽章是否合法
   * 是否過期
   * jti 是否存在
   * securityStamp 是否匹配

---

## securityStamp 設計目的

每個使用者皆有一組 `securityStamp`。

當發生以下事件：

* 密碼變更
* 強制全裝置登出
* 帳號安全事件

系統會重新產生新的 securityStamp。

所有舊 Token 立即失效。

此設計可實現：

* 全域登出
* 強制重新登入
* 安全事件快速處理

---

# 🔑 OAuth 架構設計

OAuth 模組位於：

```
src/auth/oauth/
```

目前支援：

* Google OAuth

設計上可擴充其他 Provider（Facebook、GitHub 等）。

每個 Provider：

* 交換 Authorization Code
* 取得使用者資料
* 建立或綁定帳號
* 發行系統內部 Token

核心驗證邏輯不需修改。

---

# 🧩 依賴注入設計

所有服務於：

```
src/di/container.ts
```

統一組裝。

優點：

* 依賴關係明確
* 易於替換實作
* 易於單元測試
* 模組邊界清晰

---

# 🗃 資料庫設計重點

主要資料表：

* User
* JwtToken
* ExpressSession
* OAuthAccount

設計目標：

* 可追蹤 Token 生命週期
* 支援 Token 撤銷
* 支援全域失效
* 支援多種登入來源
* 保持資料一致性

---

# 📦 日誌系統設計

使用技術：

* Winston
* Morgan
* Daily Rotate

特性：

* 結構化 JSON Log
* HTTP Access Log
* Error Log 分離
* 適用正式環境

---

# 🧠 設計取捨

本專案刻意選擇：

* 明確分層，而非簡化寫法
* 可擴充性優先
* 模組獨立性優先
* 清楚責任歸屬

此架構適合作為中型以上後端系統的基礎。

---

# 🚀 專案定位

本專案的目標不是單純實作登入功能。

而是建立一套：

* 可擴充
* 可維護
* 可測試
* 可演進

的後端驗證基礎架構。

---

# 🧑‍💻 開發說明

此專案從零開始設計與實作，目的在於深入理解：

* 驗證與授權流程
* Token 生命週期管理
* Clean Architecture 實作方式
* Dependency Injection 模式
* 生產環境等級的日誌設計
