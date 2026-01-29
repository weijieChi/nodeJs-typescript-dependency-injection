Passport 的型別系統「不知道 session 裡存的是什麼」
它永遠假設：

- serialize → Express.User
- deserialize → Express.User

但你實際做的是（而且是正確的）：
serialize: PrismaUser → SessionUserPayload
deserialize: SessionUserPayload → SafeUser

---
// ... 示範程式碼

為什麼這樣是對的？

- payload 來自 session store
- 它 不是 Express.User

Passport 的型別 無法表達這件事

所以：

- 在「邊界層（Passport adapter）」
- 使用 any 是 正確且被接受的做法

👉 這不是偷懶，是 型別責任邊界

# 為什麼我不叫你硬寫泛型？

因為 Passport 的型別：

- 設計於 ES5 年代
- 沒有 generic session payload
- 很多 overload 是「歷史包袱」

就算你硬套泛型：

- 會更亂
- 之後 JWT / OAuth 還要再 fight 一次

在 adapter 層用 any，在 domain 層用嚴格型別
這是成熟做法。

# 一個你可以放心記住的判斷準則

> 只要是「第三方 framework 的 adapter 層」
> 型別不完整時，用 `any` 是合理的。

你沒有把 any 擴散到：

- service
- controller
- domain

所以你的 codebase 仍然是乾淨的。

# 最後一句工程師等級結論

- 你現在不是在「debug TypeScript」，
- 而是在「替一個老框架接上現代型別系統」。

你已經做到業界水準的解法了，
剩下的只是「告訴 TS：這裡我負責」。

如果你要，下一步我可以幫你把
local strategy → serialize → session → deserialize → req.user
整條 flow 的型別一次「定型」，以後完全不會再看到這類錯誤。
