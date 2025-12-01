# Frontend API Dokümantasyonu

Bu dokümantasyon, MiniFlow Enterprise API'sini frontend geliştiricileri için hazırlanmıştır. Tüm endpoint'ler, middleware'ler, request/response formatları ve kullanım senaryoları detaylı olarak açıklanmıştır.

---

## 📋 İçindekiler

1. [Genel Bilgiler](#genel-bilgiler)
2. [Authentication](#authentication)
3. [Response Formatları](#response-formatları)
4. [Middleware](#middleware)
5. [Endpoint Kategorileri](#endpoint-kategorileri)
6. [Hata Yönetimi](#hata-yönetimi)
7. [Best Practices](#best-practices)

---

## Genel Bilgiler

### Base URL

- **Local Development:** `http://localhost:8000`
- **Development:** `http://dev.example.com` (config'e göre)
- **Production:** `https://api.miniflow.com` (config'e göre)

### API Versiyonlama

Şu anda API versiyonlama kullanılmamaktadır. Tüm endpoint'ler doğrudan base URL altında bulunur.

### Content-Type

- **JSON Endpoint'leri:** `application/json`
- **File Upload:** `multipart/form-data`

### Request ID Tracking

Her request'e otomatik olarak benzersiz bir `X-Request-ID` header'ı eklenir. Response'da da aynı ID `traceId` olarak döner. Bu ID, hata ayıklama ve log takibi için kullanılır.

---

## Authentication

MiniFlow Enterprise API'si iki authentication yöntemi destekler:

### 1. JWT Bearer Token (Kullanıcı Authentication)

Çoğu endpoint JWT Bearer Token ile authentication gerektirir.

**Header Format:**
```
Authorization: Bearer <access_token>
```

**Token Alma:**
1. `POST /auth/login` endpoint'ini kullanarak email/username ve password ile giriş yapın
2. Response'dan `access_token` alın
3. Bu token'ı tüm authenticated request'lerde `Authorization` header'ında kullanın

**Token Yenileme:**
- Access token'lar belirli bir süre sonra expire olur
- `POST /auth/refresh` endpoint'ini kullanarak `refresh_token` ile yeni access token alın

**Kullanım Senaryosu:**
- Kullanıcı arayüzünden yapılan tüm işlemler
- Workspace yönetimi
- Workflow oluşturma/düzenleme
- Resource yönetimi (variables, files, credentials, vb.)

### 2. API Key Authentication

API entegrasyonları için API Key kullanılabilir.

**Header Format:**
```
X-API-KEY: <api_key>
```

**API Key Oluşturma:**
1. Workspace'te `POST /workspaces/{workspace_id}/api-keys` endpoint'ini kullanarak API key oluşturun
2. Response'dan `api_key` değerini alın (sadece bir kez gösterilir!)
3. Bu key'i tüm API request'lerde `X-API-KEY` header'ında kullanın

**Kullanım Senaryosu:**
- Üçüncü parti entegrasyonlar
- Otomatik workflow tetikleme
- CI/CD pipeline'ları
- External sistemlerden API çağrıları

**Not:** API Key ile authentication yapıldığında `Authorization` header'ına gerek yoktur.

---

## Response Formatları

Tüm API response'ları standart bir format kullanır:

### Success Response

```json
{
  "status": "success",
  "code": 200,
  "message": "Operation completed successfully",
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    // Endpoint'e özel data
  }
}
```

**Alanlar:**
- `status`: `"success"` veya `"error"`
- `code`: HTTP status code (200, 201, 400, 404, vb.)
- `message`: İşlem hakkında açıklayıcı mesaj
- `traceId`: Request tracking ID (X-Request-ID ile aynı)
- `timestamp`: Response oluşturulma zamanı (ISO 8601 formatında)
- `data`: Endpoint'e özel response data

### Error Response

```json
{
  "status": "error",
  "code": 400,
  "message": null,
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2024-01-01T00:00:00Z",
  "error_message": "Validation failed",
  "error_code": "VALIDATION_ERROR"
}
```

**Alanlar:**
- `status`: `"error"`
- `code`: HTTP status code (400, 401, 403, 404, 500, vb.)
- `message`: `null` (error response'larda)
- `traceId`: Request tracking ID
- `timestamp`: Response oluşturulma zamanı
- `error_message`: Hata açıklaması
- `error_code`: Hata kodu (VALIDATION_ERROR, RESOURCE_NOT_FOUND, vb.)

### Pagination Response

List endpoint'leri pagination kullanır:

```json
{
  "status": "success",
  "code": 200,
  "message": "Resources retrieved successfully",
  "traceId": "...",
  "timestamp": "...",
  "data": {
    "items": [
      // Resource listesi
    ],
    "metadata": {
      "page": 1,
      "page_size": 100,
      "total_items": 250,
      "total_pages": 3,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

---

## Middleware

API'de üç ana middleware bulunur:

### 1. RequestIdMiddleware

Her request'e benzersiz bir ID atar ve response'da döner.

**Çalışma Şekli:**
- Request'te `X-Request-ID` header'ı varsa kullanılır, yoksa yeni UUID oluşturulur
- Request state'e `request_id` olarak kaydedilir
- Response header'ında `X-Request-ID` olarak döner
- Response body'de `traceId` olarak döner

**Frontend Kullanımı:**
- Hata durumlarında support'a `traceId` gönderilebilir
- Log takibi için kullanılabilir
- Request/response eşleştirmesi için kullanılabilir

### 2. RateLimitMiddleware

Rate limiting koruması sağlar. Üç seviyede çalışır:

#### IP Bazlı Rate Limiting
- **Dakika:** 1000 istek/dakika (default)
- **Saat:** 10,000 istek/saat (default)
- **Gün:** 100,000 istek/gün (default)
- **Kullanım:** DDoS ve abuse koruması
- **Exclude Paths:** `/`, `/health`, `/docs`, `/redoc`, `/openapi.json`

#### User Bazlı Rate Limiting
- **Dakika:** 600 istek/dakika (default)
- **Saat:** 6,000 istek/saat (default)
- **Gün:** 60,000 istek/gün (default)
- **Kullanım:** Authenticated kullanıcılar için
- **Trigger:** JWT Bearer Token ile authentication yapıldığında

#### API Key Bazlı Rate Limiting
- **Limitler:** Workspace plan'ına göre değişir
- **Kullanım:** API Key ile authentication yapıldığında
- **Plan Bazlı:** Her plan için farklı limitler (Freemium, Pro, Enterprise)

**Rate Limit Aşıldığında:**
- HTTP 429 (Too Many Requests) döner
- Response'da `retry_after` bilgisi olabilir
- `reset_time` bilgisi dönebilir

**Frontend Kullanımı:**
- Rate limit hatası alındığında kullanıcıya bilgi verilmeli
- Retry mekanizması eklenebilir (exponential backoff)
- Rate limit bilgisi UI'da gösterilebilir

### 3. ExceptionHandlerMiddleware

Merkezi hata yönetimi sağlar.

**Hata Tipleri:**
- **AppException:** Uygulama seviyesi hatalar (validation, business rules, vb.)
- **RequestValidationError:** Pydantic/FastAPI validation hataları
- **HTTPException:** Starlette HTTP hataları (404, 403, vb.)
- **Generic Exception:** Beklenmeyen hatalar

**HTTP Status Code Mapping:**
- `VALIDATION_ERROR` → 422 (Unprocessable Entity)
- `RESOURCE_NOT_FOUND` → 404 (Not Found)
- `AUTHENTICATION_FAILED` → 401 (Unauthorized)
- `FORBIDDEN` → 403 (Forbidden)
- `IP_RATE_LIMIT_EXCEEDED` → 429 (Too Many Requests)
- `INTERNAL_ERROR` → 500 (Internal Server Error)

**Frontend Kullanımı:**
- Hata mesajlarını kullanıcıya gösterin
- `error_code`'a göre farklı UI davranışları sergileyin
- `traceId`'yi loglara kaydedin

---

## Endpoint Kategorileri

### 1. Authentication (`/auth`)

Kullanıcı kayıt, giriş, token yönetimi.

#### POST `/auth/register`
**Amaç:** Yeni kullanıcı kaydı

**Frontend Kullanımı:** Kayıt sayfası

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "name": "John",
  "surname": "Doe",
  "marketing_consent": false,
  "terms_accepted_version": "AGR-1234567890ABCDEF",
  "privacy_policy_accepted_version": "AGR-FEDCBA0987654321"
}
```

**Response:**
```json
{
  "status": "success",
  "code": 201,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "id": "USR-1234567890ABCDEF",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Headers:**
- `X-Forwarded-For` (optional): IP adresi
- `User-Agent` (optional): Browser/Client bilgisi

---

#### POST `/auth/login`
**Amaç:** Kullanıcı girişi ve token alma

**Frontend Kullanımı:** Login sayfası

**Request:**
```json
{
  "email_or_username": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "USR-1234567890ABCDEF",
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
}
```

**Not:** `access_token`'ı localStorage veya secure cookie'de saklayın.

---

#### POST `/auth/logout`
**Amaç:** Mevcut session'ı sonlandırma

**Frontend Kullanımı:** Logout butonu

**Authentication:** Bearer Token gerekli

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "message": "Logged out successfully",
  "data": {
    "id": "USR-1234567890ABCDEF"
  }
}
```

---

#### POST `/auth/logout-all`
**Amaç:** Tüm session'ları sonlandırma

**Frontend Kullanımı:** Güvenlik ayarları sayfası

**Authentication:** Bearer Token gerekli

---

#### POST `/auth/refresh`
**Amaç:** Access token yenileme

**Frontend Kullanımı:** Token expire olduğunda otomatik yenileme

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

---

#### POST `/auth/verify-email`
**Amaç:** Email doğrulama

**Frontend Kullanımı:** Email doğrulama linki tıklandığında

**Request:**
```json
{
  "verification_token": "token_from_email_link"
}
```

---

#### POST `/auth/send-verification-email`
**Amaç:** Doğrulama email'i gönderme

**Frontend Kullanımı:** Email doğrulama sayfası

**Request:**
```json
{
  "user_id": "USR-1234567890ABCDEF",
  "email": "john@example.com"
}
```

---

#### POST `/auth/request-verification-email`
**Amaç:** Email adresi ile doğrulama email'i isteme

**Frontend Kullanımı:** Email doğrulama sayfası (email adresi ile)

**Request:**
```json
{
  "email": "john@example.com"
}
```

---

### 2. User Management (`/users`)

Kullanıcı profil yönetimi.

#### GET `/users/{user_id}`
**Amaç:** Kullanıcı profil bilgilerini getirme

**Frontend Kullanımı:** Profil sayfası

**Authentication:** Bearer Token gerekli (sadece kendi profilini görebilir)

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "USR-1234567890ABCDEF",
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John",
    "surname": "Doe",
    "avatar_url": "https://...",
    "country_code": "TR",
    "phone_number": "+905551234567",
    "is_email_verified": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### GET `/users/{user_id}/workspaces`
**Amaç:** Kullanıcının workspace'lerini getirme

**Frontend Kullanımı:** Workspace seçim sayfası, dashboard

**Authentication:** Bearer Token gerekli

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "owned_workspaces": [
      {
        "id": "WSP-1234567890ABCDEF",
        "name": "My Workspace",
        "slug": "my-workspace",
        "role": "OWNER"
      }
    ],
    "member_workspaces": [
      {
        "id": "WSP-FEDCBA0987654321",
        "name": "Team Workspace",
        "slug": "team-workspace",
        "role": "MEMBER"
      }
    ]
  }
}
```

---

#### GET `/users/{user_id}/sessions`
**Amaç:** Aktif session'ları getirme

**Frontend Kullanımı:** Güvenlik ayarları sayfası

**Authentication:** Bearer Token gerekli

---

#### DELETE `/users/{user_id}/sessions/{session_id}`
**Amaç:** Belirli bir session'ı sonlandırma

**Frontend Kullanımı:** Güvenlik ayarları sayfası (session listesi)

**Authentication:** Bearer Token gerekli

---

#### GET `/users/{user_id}/login-history`
**Amaç:** Giriş geçmişini getirme

**Frontend Kullanımı:** Güvenlik ayarları sayfası

**Query Parameters:**
- `limit` (optional, default: 20, max: 100): Kayıt sayısı

---

#### GET `/users/{user_id}/password-history`
**Amaç:** Şifre değiştirme geçmişini getirme

**Frontend Kullanımı:** Güvenlik ayarları sayfası

**Query Parameters:**
- `limit` (optional, default: 10, max: 50): Kayıt sayısı

**Authentication:** Bearer Token gerekli (sadece kendi geçmişini görebilir)

---

#### PUT `/users/{user_id}/username`
**Amaç:** Kullanıcı adı güncelleme

**Frontend Kullanımı:** Profil düzenleme sayfası

**Request:**
```json
{
  "new_user_name": "newusername"
}
```

---

#### PUT `/users/{user_id}/email`
**Amaç:** Email adresi güncelleme

**Frontend Kullanımı:** Profil düzenleme sayfası

**Request:**
```json
{
  "new_email": "newemail@example.com"
}
```

**Not:** Yeni email adresine doğrulama email'i gönderilir.

---

#### PATCH `/users/{user_id}`
**Amaç:** Kullanıcı bilgilerini güncelleme (avatar, name, surname, country, phone)

**Frontend Kullanımı:** Profil düzenleme sayfası

**Request:**
```json
{
  "avatar_url": "https://...",
  "name": "John",
  "surname": "Doe",
  "country_code": "TR",
  "phone_number": "+905551234567"
}
```

---

#### PUT `/users/{user_id}/password`
**Amaç:** Şifre değiştirme

**Frontend Kullanımı:** Güvenlik ayarları sayfası

**Request:**
```json
{
  "old_password": "OldPass123!",
  "new_password": "NewPass123!"
}
```

---

#### POST `/users/{user_id}/deletion-request`
**Amaç:** Hesap silme talebi oluşturma

**Frontend Kullanımı:** Hesap ayarları sayfası (hesap silme)

**Authentication:** Bearer Token gerekli (sadece kendi hesabını silebilir)

**Request:**
```json
{
  "reason": "No longer using the service"
}
```

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "message": "Account deletion requested successfully. Your account will be deleted in 30 days unless cancelled.",
  "data": {
    "id": "USR-1234567890ABCDEF",
    "deletion_requested_at": "2024-01-01T00:00:00Z",
    "deletion_scheduled_at": "2024-01-31T00:00:00Z"
  }
}
```

**Not:** Hesap 30 gün sonra silinir. Bu süre içinde iptal edilebilir.

---

#### DELETE `/users/{user_id}/deletion-request`
**Amaç:** Hesap silme talebini iptal etme

**Frontend Kullanımı:** Hesap ayarları sayfası (silme talebini iptal etme)

**Authentication:** Bearer Token gerekli

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "message": "Account deletion request cancelled successfully",
  "data": {
    "id": "USR-1234567890ABCDEF"
  }
}
```

---

#### POST `/users/password-reset/request`
**Amaç:** Şifre sıfırlama email'i isteme (Public)

**Frontend Kullanımı:** Şifre sıfırlama sayfası

**Request:**
```json
{
  "email": "user@example.com"
}
```

---

#### POST `/users/password-reset/validate`
**Amaç:** Şifre sıfırlama token'ını doğrulama (Public)

**Frontend Kullanımı:** Şifre sıfırlama sayfası (token doğrulama)

**Request:**
```json
{
  "password_reset_token": "token_from_email"
}
```

---

#### POST `/users/password-reset/reset`
**Amaç:** Şifre sıfırlama (Public)

**Frontend Kullanımı:** Şifre sıfırlama sayfası (yeni şifre belirleme)

**Request:**
```json
{
  "password_reset_token": "token_from_email",
  "password": "NewSecurePass123!"
}
```

---

### 3. Workspace Management (`/workspaces`)

Workspace oluşturma, yönetimi, limitler.

#### POST `/workspaces`
**Amaç:** Yeni workspace oluşturma

**Frontend Kullanımı:** Workspace oluşturma sayfası

**Authentication:** Bearer Token gerekli

**Request:**
```json
{
  "name": "My Workspace",
  "slug": "my-workspace",
  "description": "Workspace description"
}
```

**Response:**
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "WSP-1234567890ABCDEF",
    "name": "My Workspace",
    "slug": "my-workspace",
    "description": "Workspace description",
    "owner_id": "USR-1234567890ABCDEF"
  }
}
```

---

#### GET `/workspaces/{workspace_id}`
**Amaç:** Workspace detaylarını getirme

**Frontend Kullanımı:** Workspace ayarları sayfası, dashboard

**Authentication:** Bearer Token + Workspace membership gerekli

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "WSP-1234567890ABCDEF",
    "name": "My Workspace",
    "slug": "my-workspace",
    "description": "Workspace description",
    "plan_id": "PLN-1234567890ABCDEF",
    "plan_name": "Freemium",
    "workspace_owner_id": "USR-1234567890ABCDEF",
    "workspace_owner_email": "owner@example.com"
  }
}
```

---

#### GET `/workspaces/{workspace_id}/limits`
**Amaç:** Workspace limitlerini ve kullanımını getirme

**Frontend Kullanımı:** Workspace ayarları sayfası, dashboard

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "max_members_per_workspace": 10,
    "current_members_count": 3,
    "max_workflows_per_workspace": 50,
    "current_workflows_count": 5,
    "max_custom_scripts_per_workspace": 20,
    "current_custom_scripts_count": 2,
    "storage_limit_mb_per_workspace": 1000,
    "current_storage_mb": 150.5,
    "max_api_keys_per_workspace": 10,
    "current_api_keys_count": 1,
    "monthly_execution_limit": 1000,
    "current_month_executions": 250,
    "monthly_concurrent_executions": 10,
    "current_month_concurrent_executions": 2,
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-02-01T00:00:00Z"
  }
}
```

---

#### PUT `/workspaces/{workspace_id}`
**Amaç:** Workspace bilgilerini güncelleme

**Frontend Kullanımı:** Workspace ayarları sayfası

**Request:**
```json
{
  "name": "Updated Workspace Name",
  "slug": "updated-slug",
  "description": "Updated description"
}
```

---

#### DELETE `/workspaces/{workspace_id}`
**Amaç:** Workspace'i silme

**Frontend Kullanımı:** Workspace ayarları sayfası (tehlikeli işlemler)

**⚠️ UYARI:** Bu işlem geri alınamaz! Tüm workspace verileri silinir.

---

### 4. Workspace Members (`/workspaces/{workspace_id}/members`)

Workspace üye yönetimi.

#### GET `/workspaces/{workspace_id}/members`
**Amaç:** Workspace üyelerini listeleme

**Frontend Kullanımı:** Workspace üyeleri sayfası

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "members": [
      {
        "id": "MEM-1234567890ABCDEF",
        "user_id": "USR-1234567890ABCDEF",
        "workspace_id": "WSP-1234567890ABCDEF",
        "role_id": "ROL-1234567890ABCDEF",
        "role_name": "OWNER",
        "user": {
          "id": "USR-1234567890ABCDEF",
          "username": "johndoe",
          "email": "john@example.com"
        }
      }
    ],
    "total": 1
  }
}
```

---

#### GET `/workspaces/{workspace_id}/members/{member_id}`
**Amaç:** Belirli bir üyenin detaylarını getirme

**Frontend Kullanımı:** Üye detay sayfası

---

#### PUT `/workspaces/{workspace_id}/members/{member_id}/role`
**Amaç:** Üye rolünü değiştirme

**Frontend Kullanımı:** Workspace üyeleri sayfası (rol değiştirme)

**Request:**
```json
{
  "role_id": "ROL-FEDCBA0987654321"
}
```

---

#### DELETE `/workspaces/{workspace_id}/members/{user_id}`
**Amaç:** Üyeyi workspace'ten çıkarma

**Frontend Kullanımı:** Workspace üyeleri sayfası (üye silme)

**Not:** Workspace owner silinemez.

---

### 5. Workspace Invitations (`/workspaces/{workspace_id}/invitations`)

Workspace davet yönetimi.

#### GET `/users/{user_id}/invitations/pending`
**Amaç:** Kullanıcının bekleyen davetlerini getirme

**Frontend Kullanımı:** Bildirimler, davetler sayfası

**Authentication:** Bearer Token gerekli (sadece kendi davetlerini görebilir)

---

#### GET `/workspaces/{workspace_id}/invitations`
**Amaç:** Workspace davetlerini listeleme

**Frontend Kullanımı:** Workspace üyeleri sayfası (davet geçmişi)

---

#### POST `/workspaces/{workspace_id}/invitations`
**Amaç:** Kullanıcıyı workspace'e davet etme

**Frontend Kullanımı:** Workspace üyeleri sayfası (davet gönderme)

**Request:**
```json
{
  "user_id": "USR-1234567890ABCDEF",
  "role_id": "ROL-1234567890ABCDEF",
  "message": "Welcome to our workspace!"
}
```

---

#### POST `/invitations/{invitation_id}/accept`
**Amaç:** Daveti kabul etme

**Frontend Kullanımı:** Davetler sayfası (kabul butonu)

**Authentication:** Bearer Token gerekli

---

#### POST `/invitations/{invitation_id}/decline`
**Amaç:** Daveti reddetme

**Frontend Kullanımı:** Davetler sayfası (reddet butonu)

**Authentication:** Bearer Token gerekli

---

#### DELETE `/invitations/{invitation_id}`
**Amaç:** Daveti iptal etme

**Frontend Kullanımı:** Workspace üyeleri sayfası (davet iptal)

**Authentication:** Bearer Token gerekli (sadece davet gönderen iptal edebilir)

---

### 6. API Keys (`/workspaces/{workspace_id}/api-keys`)

API Key yönetimi.

#### GET `/workspaces/{workspace_id}/api-keys`
**Amaç:** Workspace API key'lerini listeleme

**Frontend Kullanımı:** API Keys yönetim sayfası

**Query Parameters:**
- `page` (default: 1)
- `page_size` (default: 100, max: 1000)
- `order_by` (optional)
- `order_desc` (default: false)
- `include_deleted` (default: false)

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "AKY-1234567890ABCDEF",
        "name": "Production API Key",
        "key_prefix": "sk_live_",
        "masked_key": "sk_live_****...",
        "description": "API key for production",
        "is_active": true,
        "expires_at": null,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "metadata": {
      "page": 1,
      "page_size": 100,
      "total_items": 1,
      "total_pages": 1
    }
  }
}
```

---

#### GET `/workspaces/{workspace_id}/api-keys/{api_key_id}`
**Amaç:** Belirli bir API key'in detaylarını getirme

**Frontend Kullanımı:** API Key detay sayfası

---

#### POST `/workspaces/{workspace_id}/api-keys`
**Amaç:** Yeni API key oluşturma

**Frontend Kullanımı:** API Keys yönetim sayfası (yeni key oluşturma)

**Request:**
```json
{
  "name": "Production API Key",
  "key_prefix": "sk_live_",
  "description": "API key for production",
  "permissions": {},
  "expires_at": null,
  "tags": ["production"],
  "allowed_ips": null
}
```

**Response:**
```json
{
  "status": "success",
  "code": 201,
  "message": "API key created successfully. Store it securely - it won't be shown again!",
  "data": {
    "id": "AKY-1234567890ABCDEF",
    "name": "Production API Key",
    "full_api_key": "sk_live_abc123def456...",
    "key_prefix": "sk_live_",
    "description": "API key for production"
  }
}
```

**⚠️ ÖNEMLİ:** `full_api_key` sadece bu response'da gösterilir. Güvenli bir yerde saklayın!

---

#### PUT `/workspaces/{workspace_id}/api-keys/{api_key_id}`
**Amaç:** API key'i güncelleme

**Frontend Kullanımı:** API Key detay sayfası (düzenleme)

**Request:**
```json
{
  "name": "Updated API Key Name",
  "description": "Updated description",
  "is_active": true,
  "expires_at": "2025-01-01T00:00:00Z",
  "tags": ["production", "updated"],
  "allowed_ips": ["192.168.1.1"]
}
```

---

#### DELETE `/workspaces/{workspace_id}/api-keys/{api_key_id}`
**Amaç:** API key'i silme

**Frontend Kullanımı:** API Key detay sayfası (silme butonu)

---

### 7. Variables (`/workspaces/{workspace_id}/variables`)

Workspace değişken yönetimi (secret ve non-secret).

#### GET `/workspaces/{workspace_id}/variables`
**Amaç:** Workspace değişkenlerini listeleme

**Frontend Kullanımı:** Variables yönetim sayfası

**Query Parameters:**
- `page`, `page_size`, `order_by`, `order_desc`, `include_deleted`

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "VAR-1234567890ABCDEF",
        "key": "API_URL",
        "value": "https://api.example.com",
        "is_secret": false,
        "description": "API base URL",
        "created_at": "2024-01-01T00:00:00Z"
      },
      {
        "id": "VAR-FEDCBA0987654321",
        "key": "API_SECRET",
        "value": "***MASKED***",
        "is_secret": true,
        "description": "API secret key"
      }
    ],
    "metadata": {...}
  }
}
```

**Not:** Secret değişkenlerin değerleri masked olarak döner. Detay endpoint'inde decrypt edilmiş değer döner.

---

#### GET `/workspaces/{workspace_id}/variables/{variable_id}`
**Amaç:** Belirli bir değişkenin detaylarını getirme

**Frontend Kullanımı:** Variable detay sayfası

**Not:** Secret değişkenlerin değerleri bu endpoint'te decrypt edilmiş olarak döner.

---

#### POST `/workspaces/{workspace_id}/variables`
**Amaç:** Yeni değişken oluşturma

**Frontend Kullanımı:** Variables yönetim sayfası (yeni variable oluşturma)

**Request:**
```json
{
  "key": "API_URL",
  "value": "https://api.example.com",
  "description": "API base URL",
  "is_secret": false
}
```

**Not:** `is_secret: true` ise değer otomatik olarak encrypt edilir.

---

#### PUT `/workspaces/{workspace_id}/variables/{variable_id}`
**Amaç:** Değişkeni güncelleme

**Frontend Kullanımı:** Variable detay sayfası (düzenleme)

**Request:**
```json
{
  "key": "UPDATED_API_URL",
  "value": "https://new-api.example.com",
  "description": "Updated API URL",
  "is_secret": false
}
```

**Not:** Secret'tan non-secret'e veya tersine geçiş yapıldığında otomatik encrypt/decrypt yapılır.

---

#### DELETE `/workspaces/{workspace_id}/variables/{variable_id}`
**Amaç:** Değişkeni silme

**Frontend Kullanımı:** Variable detay sayfası (silme butonu)

---

### 8. Credentials (`/workspaces/{workspace_id}/credentials`)

Harici servis credential yönetimi (API keys, OAuth tokens, vb.).

#### GET `/workspaces/{workspace_id}/credentials`
**Amaç:** Workspace credential'larını listeleme

**Frontend Kullanımı:** Credentials yönetim sayfası

**Query Parameters:**
- `credential_type` (optional): API_KEY, OAUTH2, BASIC_AUTH, JWT, AWS_CREDENTIALS, vb.
- `page`, `page_size`, `order_by`, `order_desc`, `include_deleted`

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "CRD-1234567890ABCDEF",
        "name": "GitHub API Key",
        "credential_type": "API_KEY",
        "credential_provider": "GITHUB",
        "is_active": true,
        "expires_at": null,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "metadata": {...}
  }
}
```

**Not:** Credential data otomatik olarak decrypt edilmiş olarak döner.

---

#### GET `/workspaces/{workspace_id}/credentials/{credential_id}`
**Amaç:** Belirli bir credential'ın detaylarını getirme

**Frontend Kullanımı:** Credential detay sayfası

---

#### POST `/workspaces/{workspace_id}/credentials`
**Amaç:** Yeni credential oluşturma

**Frontend Kullanımı:** Credentials yönetim sayfası (yeni credential oluşturma)

**Request:**
```json
{
  "name": "GitHub API Key",
  "api_key": "ghp_abc123def456...",
  "credential_provider": "GITHUB",
  "description": "GitHub API key for repository access",
  "tags": ["github", "api"],
  "expires_at": null,
  "is_active": true
}
```

**Not:** API key otomatik olarak encrypt edilir.

---

#### DELETE `/workspaces/{workspace_id}/credentials/{credential_id}`
**Amaç:** Credential'ı silme

**Frontend Kullanımı:** Credential detay sayfası (silme butonu)

---

### 9. Databases (`/workspaces/{workspace_id}/databases`)

Veritabanı bağlantı yönetimi.

#### GET `/workspaces/{workspace_id}/databases`
**Amaç:** Workspace veritabanı bağlantılarını listeleme

**Frontend Kullanımı:** Databases yönetim sayfası

**Query Parameters:**
- `page`, `page_size`, `order_by`, `order_desc`, `include_deleted`

---

#### GET `/workspaces/{workspace_id}/databases/{database_id}`
**Amaç:** Belirli bir veritabanı bağlantısının detaylarını getirme

**Frontend Kullanımı:** Database detay sayfası

**Not:** Password otomatik olarak decrypt edilmiş olarak döner.

---

#### POST `/workspaces/{workspace_id}/databases`
**Amaç:** Yeni veritabanı bağlantısı oluşturma

**Frontend Kullanımı:** Databases yönetim sayfası (yeni database oluşturma)

**Request:**
```json
{
  "name": "Production PostgreSQL",
  "database_type": "POSTGRESQL",
  "host": "db.example.com",
  "port": 5432,
  "database_name": "mydb",
  "username": "dbuser",
  "password": "dbpassword",
  "ssl_enabled": true,
  "description": "Production database connection",
  "tags": ["production", "postgresql"],
  "is_active": true
}
```

**Alternatif:** `connection_string` kullanılabilir:
```json
{
  "name": "Production PostgreSQL",
  "database_type": "POSTGRESQL",
  "connection_string": "postgresql://user:pass@host:port/dbname",
  "ssl_enabled": true
}
```

**Not:** Password otomatik olarak encrypt edilir.

---

#### PUT `/workspaces/{workspace_id}/databases/{database_id}`
**Amaç:** Veritabanı bağlantısını güncelleme

**Frontend Kullanımı:** Database detay sayfası (düzenleme)

---

#### DELETE `/workspaces/{workspace_id}/databases/{database_id}`
**Amaç:** Veritabanı bağlantısını silme

**Frontend Kullanımı:** Database detay sayfası (silme butonu)

---

### 10. Files (`/workspaces/{workspace_id}/files`)

Dosya yönetimi (upload, download, metadata).

#### GET `/workspaces/{workspace_id}/files`
**Amaç:** Workspace dosyalarını listeleme

**Frontend Kullanımı:** Files yönetim sayfası

**Query Parameters:**
- `page`, `page_size`, `order_by`, `order_desc`, `include_deleted`

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "FIL-1234567890ABCDEF",
        "name": "document.pdf",
        "original_filename": "document.pdf",
        "file_path": "WSP-1234567890ABCDEF/document.pdf",
        "file_size_mb": 2.5,
        "mime_type": "application/pdf",
        "description": "Important document",
        "tags": ["document", "pdf"],
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "metadata": {...}
  }
}
```

---

#### GET `/workspaces/{workspace_id}/files/{file_id}`
**Amaç:** Dosya metadata'sını getirme

**Frontend Kullanımı:** File detay sayfası

---

#### GET `/workspaces/{workspace_id}/files/{file_id}/content`
**Amaç:** Dosya içeriğini indirme

**Frontend Kullanımı:** File download butonu

**Response:** Binary file content (Content-Type ve Content-Disposition header'ları ile)

---

#### POST `/workspaces/{workspace_id}/files`
**Amaç:** Dosya yükleme

**Frontend Kullanımı:** File upload sayfası, drag & drop alanı

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (required): File object
- `name` (optional): Custom file name
- `description` (optional): File description
- `tags` (optional): Comma-separated tags

**cURL Örneği:**
```bash
curl -X POST "http://localhost:8000/workspaces/WSP-123/files" \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/file.pdf" \
  -F "name=My Document" \
  -F "description=Important document" \
  -F "tags=document,pdf"
```

**Response:**
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "FIL-1234567890ABCDEF",
    "name": "My Document",
    "file_size_mb": 2.5,
    "mime_type": "application/pdf"
  }
}
```

---

#### PUT `/workspaces/{workspace_id}/files/{file_id}`
**Amaç:** Dosya metadata'sını güncelleme

**Frontend Kullanımı:** File detay sayfası (metadata düzenleme)

**Request:**
```json
{
  "name": "Updated Document Name",
  "description": "Updated description",
  "tags": ["document", "updated"]
}
```

**Not:** Bu endpoint sadece metadata'yı günceller, dosya içeriğini değiştirmez.

---

#### DELETE `/workspaces/{workspace_id}/files/{file_id}`
**Amaç:** Dosyayı silme

**Frontend Kullanımı:** File detay sayfası (silme butonu)

**Not:** Dosya hem storage'dan hem de database'den silinir. Workspace storage kullanımı otomatik güncellenir.

---

### 11. Global Scripts (`/scripts`)

Global script'ler (tüm workspace'lerde kullanılabilir).

#### GET `/scripts`
**Amaç:** Global script'leri listeleme

**Frontend Kullanımı:** Script library sayfası, node oluşturma sayfası (script seçimi)

**Query Parameters:**
- `page`, `page_size`, `order_by`, `order_desc`, `include_deleted`
- `category` (optional): Script kategorisi
- `subcategory` (optional): Script alt kategorisi

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "SCR-1234567890ABCDEF",
        "name": "add_numbers",
        "category": "math",
        "subcategory": "arithmetic",
        "description": "Add two numbers",
        "tags": ["math", "arithmetic"],
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "metadata": {...}
  }
}
```

**Not:** Bu endpoint public'tir, authentication gerektirmez.

---

#### GET `/scripts/{script_id}`
**Amaç:** Belirli bir global script'in metadata'sını getirme

**Frontend Kullanımı:** Script detay sayfası

**Not:** Bu endpoint public'tir, authentication gerektirmez.

---

#### GET `/scripts/{script_id}/content`
**Amaç:** Script içeriğini, input schema ve output schema'yı getirme

**Frontend Kullanımı:** Script detay sayfası, node oluşturma sayfası (schema görüntüleme)

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "content": "def add_numbers(a: int, b: int) -> int:\n    return a + b",
    "input_schema": {
      "a": {"type": "int", "required": true},
      "b": {"type": "int", "required": true}
    },
    "output_schema": {
      "result": {"type": "int"}
    }
  }
}
```

**Not:** Bu endpoint public'tir, authentication gerektirmez.

---

#### POST `/scripts`
**Amaç:** Yeni global script oluşturma

**Frontend Kullanımı:** Script yönetim sayfası (admin)

**Authentication:** Bearer Token gerekli

**Request:**
```json
{
  "name": "multiply_numbers",
  "category": "math",
  "subcategory": "arithmetic",
  "description": "Multiply two numbers",
  "content": "def multiply_numbers(a: int, b: int) -> int:\n    return a * b",
  "input_schema": {
    "a": {"type": "int", "required": true},
    "b": {"type": "int", "required": true}
  },
  "output_schema": {
    "result": {"type": "int"}
  },
  "required_packages": [],
  "tags": ["math", "arithmetic"]
}
```

---

#### PUT `/scripts/{script_id}`
**Amaç:** Global script metadata'sını güncelleme

**Frontend Kullanımı:** Script yönetim sayfası (admin)

**Authentication:** Bearer Token gerekli

**Not:** Bu endpoint sadece metadata'yı günceller, script içeriğini değiştirmez.

---

#### DELETE `/scripts/{script_id}`
**Amaç:** Global script'i silme

**Frontend Kullanımı:** Script yönetim sayfası (admin)

**Authentication:** Bearer Token gerekli

---

### 12. Custom Scripts (`/workspaces/{workspace_id}/custom-scripts`)

Workspace'e özel script'ler.

#### GET `/workspaces/{workspace_id}/custom-scripts`
**Amaç:** Workspace custom script'lerini listeleme

**Frontend Kullanımı:** Custom Scripts yönetim sayfası, node oluşturma sayfası (script seçimi)

**Query Parameters:**
- `page`, `page_size`, `order_by`, `order_desc`, `include_deleted`
- `category` (optional)
- `subcategory` (optional)
- `approval_status` (optional): PENDING, APPROVED, REJECTED, REVISION_NEEDED
- `test_status` (optional): UNTESTED, TESTING, PASSED, FAILED, PARTIAL

---

#### GET `/workspaces/{workspace_id}/custom-scripts/{custom_script_id}`
**Amaç:** Belirli bir custom script'in metadata'sını getirme

**Frontend Kullanımı:** Custom Script detay sayfası

---

#### GET `/workspaces/{workspace_id}/custom-scripts/{custom_script_id}/content`
**Amaç:** Custom script içeriğini, input schema ve output schema'yı getirme

**Frontend Kullanımı:** Custom Script detay sayfası, node oluşturma sayfası (schema görüntüleme)

---

#### POST `/workspaces/{workspace_id}/custom-scripts`
**Amaç:** Yeni custom script oluşturma

**Frontend Kullanımı:** Custom Scripts yönetim sayfası (yeni script oluşturma)

**Request:**
```json
{
  "name": "custom_data_processor",
  "content": "def process_data(data):\n    return data.upper()",
  "description": "Custom data processor",
  "category": "data",
  "subcategory": "processing",
  "input_schema": {
    "data": {"type": "str", "required": true}
  },
  "output_schema": {
    "result": {"type": "str"}
  },
  "required_packages": [],
  "tags": ["custom", "data"]
}
```

**Not:** Custom script'ler onay sürecinden geçer (approval_status: PENDING).

---

#### PUT `/workspaces/{workspace_id}/custom-scripts/{custom_script_id}`
**Amaç:** Custom script metadata'sını güncelleme

**Frontend Kullanımı:** Custom Script detay sayfası (metadata düzenleme)

**Not:** Bu endpoint sadece metadata'yı günceller, script içeriğini değiştirmez.

---

#### DELETE `/workspaces/{workspace_id}/custom-scripts/{custom_script_id}`
**Amaç:** Custom script'i silme

**Frontend Kullanımı:** Custom Script detay sayfası (silme butonu)

---

### 13. Workflows (`/workspaces/{workspace_id}/workflows`)

Workflow yönetimi.

#### GET `/workspaces/{workspace_id}/workflows`
**Amaç:** Workspace workflow'larını listeleme

**Frontend Kullanımı:** Workflows listesi sayfası, dashboard

**Query Parameters:**
- `page`, `page_size`, `order_by`, `order_desc`, `include_deleted`
- `status` (optional): DRAFT, ACTIVE, DEACTIVATED, ARCHIVED

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "WFL-1234567890ABCDEF",
        "name": "Data Processing Workflow",
        "description": "Process and transform data",
        "status": "ACTIVE",
        "priority": 1,
        "tags": ["data", "processing"],
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "metadata": {...}
  }
}
```

---

#### GET `/workspaces/{workspace_id}/workflows/{workflow_id}`
**Amaç:** Belirli bir workflow'un detaylarını getirme

**Frontend Kullanımı:** Workflow editor sayfası, workflow detay sayfası

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "WFL-1234567890ABCDEF",
    "name": "Data Processing Workflow",
    "description": "Process and transform data",
    "status": "ACTIVE",
    "status_message": null,
    "priority": 1,
    "tags": ["data", "processing"],
    "workspace_id": "WSP-1234567890ABCDEF",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST `/workspaces/{workspace_id}/workflows`
**Amaç:** Yeni workflow oluşturma

**Frontend Kullanımı:** Workflow oluşturma sayfası

**Request:**
```json
{
  "name": "New Workflow",
  "description": "Workflow description",
  "priority": 1,
  "status": "DRAFT",
  "status_message": null,
  "tags": ["new", "workflow"]
}
```

**Response:**
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "WFL-1234567890ABCDEF",
    "name": "New Workflow",
    "description": "Workflow description",
    "status": "DRAFT",
    "priority": 1,
    "tags": ["new", "workflow"]
  }
}
```

**Not:** Workflow oluşturulduğunda otomatik olarak bir default API trigger (WEBHOOK type, "DEFAULT" name) oluşturulur.

---

#### PUT `/workspaces/{workspace_id}/workflows/{workflow_id}`
**Amaç:** Workflow'u güncelleme

**Frontend Kullanımı:** Workflow editor sayfası (workflow ayarları)

**Request:**
```json
{
  "name": "Updated Workflow Name",
  "description": "Updated description",
  "status": "ACTIVE",
  "priority": 2,
  "tags": ["updated", "workflow"]
}
```

---

#### DELETE `/workspaces/{workspace_id}/workflows/{workflow_id}`
**Amaç:** Workflow'u silme

**Frontend Kullanımı:** Workflow ayarları sayfası (silme butonu)

**⚠️ UYARI:** Bu işlem geri alınamaz! Workflow, tüm node'lar, edge'ler, trigger'lar ve execution'lar silinir.

---

### 14. Nodes (`/workspaces/{workspace_id}/workflows/{workflow_id}/nodes`)

Workflow node yönetimi.

#### GET `/workspaces/{workspace_id}/workflows/{workflow_id}/nodes`
**Amaç:** Workflow node'larını listeleme

**Frontend Kullanımı:** Workflow editor sayfası (node listesi)

**Query Parameters:**
- `page`, `page_size`, `order_by`, `order_desc`, `include_deleted`

---

#### GET `/workspaces/{workspace_id}/workflows/{workflow_id}/nodes/{node_id}`
**Amaç:** Belirli bir node'un detaylarını getirme

**Frontend Kullanımı:** Workflow editor sayfası (node detay paneli)

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "NOD-1234567890ABCDEF",
    "name": "Add Numbers",
    "description": "Add two numbers",
    "workflow_id": "WFL-1234567890ABCDEF",
    "script_id": "SCR-1234567890ABCDEF",
    "custom_script_id": null,
    "input_params": {
      "a": 10,
      "b": 20
    },
    "output_params": {},
    "max_retries": 3,
    "timeout_seconds": 300,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### GET `/workspaces/{workspace_id}/workflows/{workflow_id}/nodes/{node_id}/form-schema`
**Amaç:** Node için frontend form schema'sını getirme

**Frontend Kullanımı:** Workflow editor sayfası (node form düzenleme)

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "schema": {
      "a": {
        "type": "int",
        "required": true,
        "default": null,
        "description": "First number"
      },
      "b": {
        "type": "int",
        "required": true,
        "default": null,
        "description": "Second number"
      }
    },
    "current_values": {
      "a": 10,
      "b": 20
    }
  }
}
```

**Not:** Bu endpoint, script'in `input_schema`'sını node'un mevcut `input_params` değerleriyle birleştirerek frontend-friendly bir form schema döner.

---

#### POST `/workspaces/{workspace_id}/workflows/{workflow_id}/nodes`
**Amaç:** Yeni node oluşturma

**Frontend Kullanımı:** Workflow editor sayfası (yeni node ekleme)

**Request:**
```json
{
  "name": "Add Numbers",
  "script_id": "SCR-1234567890ABCDEF",
  "description": "Add two numbers",
  "input_params": {
    "a": 10,
    "b": 20
  },
  "output_params": {},
  "max_retries": 3,
  "timeout_seconds": 300
}
```

**Not:** `script_id` veya `custom_script_id`'den biri mutlaka belirtilmelidir. İkisi birden belirtilemez.

---

#### PUT `/workspaces/{workspace_id}/workflows/{workflow_id}/nodes/{node_id}`
**Amaç:** Node'u güncelleme

**Frontend Kullanımı:** Workflow editor sayfası (node düzenleme)

**Request:**
```json
{
  "name": "Updated Node Name",
  "description": "Updated description",
  "input_params": {
    "a": 15,
    "b": 25
  },
  "max_retries": 5,
  "timeout_seconds": 600
}
```

**Not:** `input_params` script'in `input_schema`'sına göre validate edilir.

---

#### PATCH `/workspaces/{workspace_id}/workflows/{workflow_id}/nodes/{node_id}/input-params`
**Amaç:** Sadece node input parametrelerini güncelleme

**Frontend Kullanımı:** Workflow editor sayfası (hızlı input düzenleme)

**Request:**
```json
{
  "input_params": {
    "a": 20,
    "b": 30
  }
}
```

**Not:** Bu endpoint sadece `input_params`'ı günceller, diğer node özelliklerini etkilemez.

---

#### DELETE `/workspaces/{workspace_id}/workflows/{workflow_id}/nodes/{node_id}`
**Amaç:** Node'u silme

**Frontend Kullanımı:** Workflow editor sayfası (node silme butonu)

**Not:** Node silindiğinde bağlı tüm edge'ler de silinir (CASCADE).

---

### 15. Edges (`/workspaces/{workspace_id}/workflows/{workflow_id}/edges`)

Workflow edge (bağlantı) yönetimi.

#### GET `/workspaces/{workspace_id}/workflows/{workflow_id}/edges`
**Amaç:** Workflow edge'lerini listeleme

**Frontend Kullanımı:** Workflow editor sayfası (edge listesi, graph görünümü)

**Query Parameters:**
- `page`, `page_size`, `order_by`, `order_desc`, `include_deleted`
- `from_node_id` (optional): Source node ID'ye göre filtreleme
- `to_node_id` (optional): Target node ID'ye göre filtreleme

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "EDG-1234567890ABCDEF",
        "workflow_id": "WFL-1234567890ABCDEF",
        "from_node_id": "NOD-1234567890ABCDEF",
        "to_node_id": "NOD-FEDCBA0987654321",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "metadata": {...}
  }
}
```

---

#### GET `/workspaces/{workspace_id}/workflows/{workflow_id}/edges/{edge_id}`
**Amaç:** Belirli bir edge'in detaylarını getirme

**Frontend Kullanımı:** Workflow editor sayfası (edge detay paneli)

---

#### POST `/workspaces/{workspace_id}/workflows/{workflow_id}/edges`
**Amaç:** Yeni edge oluşturma

**Frontend Kullanımı:** Workflow editor sayfası (node'lar arası bağlantı oluşturma)

**Request:**
```json
{
  "from_node_id": "NOD-1234567890ABCDEF",
  "to_node_id": "NOD-FEDCBA0987654321"
}
```

**Notlar:**
- Her iki node da aynı workflow'a ait olmalıdır
- Self-loop (node'un kendisine bağlanması) engellenir
- Aynı iki node arasında duplicate edge oluşturulamaz

---

#### PUT `/workspaces/{workspace_id}/workflows/{workflow_id}/edges/{edge_id}`
**Amaç:** Edge'i güncelleme

**Frontend Kullanımı:** Workflow editor sayfası (edge düzenleme)

**Request:**
```json
{
  "from_node_id": "NOD-NEW1234567890ABCD",
  "to_node_id": "NOD-NEWFEDCBA098765432"
}
```

---

#### DELETE `/workspaces/{workspace_id}/workflows/{workflow_id}/edges/{edge_id}`
**Amaç:** Edge'i silme

**Frontend Kullanımı:** Workflow editor sayfası (edge silme butonu)

---

### 16. Triggers (`/workspaces/{workspace_id}/triggers`)

Workflow trigger yönetimi.

#### GET `/workspaces/{workspace_id}/triggers`
**Amaç:** Workspace trigger'larını listeleme

**Frontend Kullanımı:** Triggers yönetim sayfası

**Query Parameters:**
- `page`, `page_size`, `order_by`, `order_desc`, `include_deleted`
- `workflow_id` (optional): Belirli bir workflow'a ait trigger'ları filtreleme
- `trigger_type` (optional): MANUAL, SCHEDULED, WEBHOOK, EVENT
- `is_enabled` (optional): true/false

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "TRG-1234567890ABCDEF",
        "name": "DEFAULT",
        "trigger_type": "WEBHOOK",
        "workflow_id": "WFL-1234567890ABCDEF",
        "is_enabled": true,
        "config": {
          "webhook_url": "https://api.example.com/webhooks/..."
        },
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "metadata": {...}
  }
}
```

---

#### GET `/workspaces/{workspace_id}/triggers/{trigger_id}`
**Amaç:** Belirli bir trigger'ın detaylarını getirme

**Frontend Kullanımı:** Trigger detay sayfası

---

#### POST `/workspaces/{workspace_id}/workflows/{workflow_id}/triggers`
**Amaç:** Yeni trigger oluşturma

**Frontend Kullanımı:** Trigger oluşturma sayfası

**Request (WEBHOOK):**
```json
{
  "name": "Webhook Trigger",
  "trigger_type": "WEBHOOK",
  "config": {
    "webhook_url": "https://api.example.com/webhooks/trigger"
  },
  "description": "Webhook trigger for external systems",
  "input_mapping": {
    "data": {
      "type": "dict",
      "required": true
    }
  },
  "is_enabled": true
}
```

**Request (SCHEDULED):**
```json
{
  "name": "Daily Trigger",
  "trigger_type": "SCHEDULED",
  "config": {
    "cron_expression": "0 0 * * *",
    "timezone": "UTC"
  },
  "description": "Daily scheduled trigger",
  "is_enabled": true
}
```

**Not:** Trigger name workspace içinde unique olmalıdır.

---

#### PUT `/workspaces/{workspace_id}/triggers/{trigger_id}`
**Amaç:** Trigger'ı güncelleme

**Frontend Kullanımı:** Trigger detay sayfası (düzenleme)

**Request:**
```json
{
  "name": "Updated Trigger Name",
  "description": "Updated description",
  "config": {
    "webhook_url": "https://new-url.example.com/webhook"
  },
  "input_mapping": {
    "data": {
      "type": "dict",
      "required": true
    }
  },
  "is_enabled": false
}
```

---

#### DELETE `/workspaces/{workspace_id}/triggers/{trigger_id}`
**Amaç:** Trigger'ı silme

**Frontend Kullanımı:** Trigger detay sayfası (silme butonu)

---

### 17. Executions (`/workspaces/{workspace_id}/executions`)

Workflow execution yönetimi ve takibi.

#### POST `/workspaces/{workspace_id}/workflows/{workflow_id}/executions`
**Amaç:** Workflow execution'ı başlatma (UI-triggered)

**Frontend Kullanımı:** Workflow editor sayfası (çalıştır butonu), workflow detay sayfası

**Request:**
```json
{
  "input_data": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "EXE-1234567890ABCDEF",
    "workspace_id": "WSP-1234567890ABCDEF",
    "workflow_id": "WFL-1234567890ABCDEF",
    "trigger_id": null,
    "status": "PENDING",
    "trigger_data": {
      "key1": "value1",
      "key2": "value2"
    },
    "started_at": "2024-01-01T00:00:00Z",
    "triggered_by": "USR-1234567890ABCDEF"
  }
}
```

**Not:** Bu endpoint trigger gerektirmez, direkt workflow üzerinden execution başlatır.

---

#### GET `/workspaces/{workspace_id}/executions/{execution_id}`
**Amaç:** Belirli bir execution'ın detaylarını getirme

**Frontend Kullanımı:** Execution detay sayfası, execution log sayfası

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "EXE-1234567890ABCDEF",
    "workspace_id": "WSP-1234567890ABCDEF",
    "workflow_id": "WFL-1234567890ABCDEF",
    "trigger_id": null,
    "status": "COMPLETED",
    "trigger_data": {
      "key1": "value1"
    },
    "results": {
      "NOD-1234567890ABCDEF": {
        "status": "SUCCESS",
        "result_data": {
          "result": 30
        },
        "duration_seconds": 0.5,
        "memory_mb": 10.5,
        "cpu_percent": 15.2
      }
    },
    "started_at": "2024-01-01T00:00:00Z",
    "ended_at": "2024-01-01T00:00:01Z",
    "duration_seconds": 1.0,
    "triggered_by": "USR-1234567890ABCDEF"
  }
}
```

---

#### GET `/workspaces/{workspace_id}/executions`
**Amaç:** Workspace execution'larını listeleme

**Frontend Kullanımı:** Executions listesi sayfası, execution history sayfası

**Query Parameters:**
- `page` (default: 1)
- `page_size` (default: 100, max: 1000)
- `order_by` (optional, default: created_at)
- `order_desc` (default: true)
- `include_deleted` (default: false)

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "EXE-1234567890ABCDEF",
        "workflow_id": "WFL-1234567890ABCDEF",
        "status": "COMPLETED",
        "started_at": "2024-01-01T00:00:00Z",
        "ended_at": "2024-01-01T00:00:01Z",
        "duration_seconds": 1.0
      }
    ],
    "metadata": {
      "page": 1,
      "page_size": 100,
      "total_items": 50,
      "total_pages": 1
    }
  }
}
```

---

#### GET `/workspaces/{workspace_id}/executions/last`
**Amaç:** Son N execution'ı getirme

**Frontend Kullanımı:** Dashboard (son execution'lar), execution history sayfası (hızlı görünüm)

**Query Parameters:**
- `limit` (default: 5, min: 1, max: 100)

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "EXE-1234567890ABCDEF",
        "workflow_id": "WFL-1234567890ABCDEF",
        "status": "COMPLETED",
        "started_at": "2024-01-01T00:00:00Z"
      }
    ],
    "count": 5
  }
}
```

---

### 18. Workspace Plans (`/workspace-plans`)

Workspace plan bilgileri ve API limitleri.

#### GET `/workspace-plans/api-limits`
**Amaç:** Tüm plan'ların API rate limit'lerini getirme

**Frontend Kullanımı:** Plan karşılaştırma sayfası, pricing sayfası

**Not:** Bu endpoint public'tir, authentication gerektirmez.

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "PLN-1234567890ABCDEF": {
      "limits": {
        "minute": 100,
        "hour": 1000,
        "day": 10000
      }
    },
    "PLN-FEDCBA0987654321": {
      "limits": {
        "minute": 500,
        "hour": 5000,
        "day": 50000
      }
    }
  }
}
```

---

### 19. Agreements (`/agreements`)

Kullanım şartları ve gizlilik politikası.

#### GET `/agreements/active`
**Amaç:** Aktif agreement versiyonunu getirme

**Frontend Kullanımı:** Kayıt sayfası (terms/privacy policy gösterimi)

**Query Parameters:**
- `agreement_type` (required): "terms" veya "privacy_policy"
- `locale` (optional, default: "tr-TR"): Locale code

**Not:** Bu endpoint public'tir, authentication gerektirmez.

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "AGR-1234567890ABCDEF",
    "agreement_type": "terms",
    "version": "1.0",
    "locale": "tr-TR",
    "content": "Terms of service content...",
    "is_active": true,
    "effective_date": "2024-01-01T00:00:00Z"
  }
}
```

---

## Hata Yönetimi

### HTTP Status Codes

- **200 OK:** İşlem başarılı
- **201 Created:** Kaynak başarıyla oluşturuldu
- **400 Bad Request:** Geçersiz request (validation hatası, vb.)
- **401 Unauthorized:** Authentication gerekli veya token geçersiz
- **403 Forbidden:** Yetki yetersiz
- **404 Not Found:** Kaynak bulunamadı
- **409 Conflict:** Kaynak zaten mevcut (duplicate)
- **422 Unprocessable Entity:** Validation hatası
- **429 Too Many Requests:** Rate limit aşıldı
- **500 Internal Server Error:** Sunucu hatası

### Error Codes

- `VALIDATION_ERROR`: Request validation hatası
- `RESOURCE_NOT_FOUND`: Kaynak bulunamadı
- `RESOURCE_ALREADY_EXISTS`: Kaynak zaten mevcut
- `AUTHENTICATION_FAILED`: Authentication başarısız
- `FORBIDDEN`: Yetki yetersiz
- `IP_RATE_LIMIT_EXCEEDED`: IP rate limit aşıldı
- `USER_RATE_LIMIT_EXCEEDED`: User rate limit aşıldı
- `API_KEY_MINUTE_RATE_LIMIT_EXCEEDED`: API key dakika limiti aşıldı
- `API_KEY_HOUR_RATE_LIMIT_EXCEEDED`: API key saat limiti aşıldı
- `API_KEY_DAY_RATE_LIMIT_EXCEEDED`: API key gün limiti aşıldı
- `INTERNAL_ERROR`: Beklenmeyen sunucu hatası

### Hata Yönetimi Best Practices

1. **Error Handling:**
   - Tüm API çağrılarını try-catch ile sarmalayın
   - `error_code`'a göre farklı UI mesajları gösterin
   - `traceId`'yi loglara kaydedin

2. **Rate Limit Handling:**
   - 429 hatası alındığında kullanıcıya bilgi verin
   - Retry mekanizması ekleyin (exponential backoff)
   - Rate limit bilgisini UI'da gösterin

3. **Token Expiration:**
   - 401 hatası alındığında token'ı yenileyin
   - Refresh token ile yeni access token alın
   - Token yenileme başarısız olursa kullanıcıyı login sayfasına yönlendirin

---

## Best Practices

### 1. Authentication

- Access token'ı güvenli bir yerde saklayın (localStorage veya secure cookie)
- Token expire olmadan önce otomatik yenileme mekanizması ekleyin
- Logout olduğunda token'ı temizleyin

### 2. Request Management

- Request ID'yi loglara kaydedin
- Loading state'leri gösterin
- Optimistic updates kullanın (uygunsa)
- Request cancellation ekleyin (component unmount olduğunda)

### 3. Error Handling

- Kullanıcı dostu hata mesajları gösterin
- Network hatalarını handle edin
- Retry mekanizması ekleyin (uygunsa)
- Error boundary kullanın

### 4. Pagination

- Infinite scroll veya "Load More" butonu kullanın
- Page size'ı kullanıcı tercihine göre ayarlanabilir yapın
- Total count bilgisini gösterin

### 5. File Upload

- Progress bar gösterin
- File size validation yapın (frontend'de)
- Drag & drop desteği ekleyin
- Multiple file upload desteği ekleyin (uygunsa)

### 6. Real-time Updates

- Execution status'u için polling kullanın (WebSocket yoksa)
- WebSocket bağlantısı varsa real-time updates kullanın
- Optimistic updates ile UI'ı hızlı güncelleyin

### 7. Caching

- GET request'lerini cache'leyin (uygunsa)
- Cache invalidation stratejisi belirleyin
- Stale-while-revalidate pattern kullanın

### 8. Security

- Sensitive data'yı (API keys, passwords) UI'da göstermeyin
- XSS koruması için input sanitization yapın
- CSRF token kullanın (gerekirse)

---

## Örnek Frontend Kullanım Senaryoları

### Senaryo 1: Kullanıcı Girişi ve Workspace Seçimi

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:8000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email_or_username: 'user@example.com',
    password: 'password'
  })
});
const { data } = await loginResponse.json();
localStorage.setItem('access_token', data.access_token);

// 2. Get User Workspaces
const workspacesResponse = await fetch(
  `http://localhost:8000/users/${data.user.id}/workspaces`,
  {
    headers: {
      'Authorization': `Bearer ${data.access_token}`
    }
  }
);
const { data: workspacesData } = await workspacesResponse.json();
// Show workspace selection UI
```

### Senaryo 2: Workflow Oluşturma ve Node Ekleme

```javascript
// 1. Create Workflow
const workflowResponse = await fetch(
  `http://localhost:8000/workspaces/${workspaceId}/workflows`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'My Workflow',
      description: 'Workflow description',
      status: 'DRAFT'
    })
  }
);
const { data: workflow } = await workflowResponse.json();

// 2. Get Available Scripts
const scriptsResponse = await fetch('http://localhost:8000/scripts?category=math');
const { data: scriptsData } = await scriptsResponse.json();

// 3. Create Node
const nodeResponse = await fetch(
  `http://localhost:8000/workspaces/${workspaceId}/workflows/${workflow.id}/nodes`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Add Numbers',
      script_id: scriptsData.items[0].id,
      input_params: { a: 10, b: 20 }
    })
  }
);
```

### Senaryo 3: Execution Başlatma ve Takibi

```javascript
// 1. Start Execution
const executionResponse = await fetch(
  `http://localhost:8000/workspaces/${workspaceId}/workflows/${workflowId}/executions`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input_data: { key1: 'value1', key2: 'value2' }
    })
  }
);
const { data: execution } = await executionResponse.json();

// 2. Poll Execution Status
const pollInterval = setInterval(async () => {
  const statusResponse = await fetch(
    `http://localhost:8000/workspaces/${workspaceId}/executions/${execution.id}`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );
  const { data: executionData } = await statusResponse.json();
  
  if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(executionData.status)) {
    clearInterval(pollInterval);
    // Show final status
  } else {
    // Update UI with current status
  }
}, 1000); // Poll every second
```

---

## Son Notlar

- Tüm endpoint'ler Swagger UI'da test edilebilir: `http://localhost:8000/docs`
- OpenAPI schema: `http://localhost:8000/openapi.json`
- Environment variables kullanarak base URL'i dinamik yapın
- Request/Response örnekleri için Swagger UI'ı kullanın
- Hata durumlarında `traceId`'yi support'a gönderin

---

**Son Güncelleme:** 2024  
**API Versiyonu:** 1.0  
**Toplam Endpoint Sayısı:** 100+

