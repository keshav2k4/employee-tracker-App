# LazyLedgers API Integration

## Overview
Successfully integrated the LazyLedgers Live API into the employee tracker application. The integration uses the actual API endpoints from the provided Postman collection.

## API Configuration
- **Base URL**: `http://app.lazyledgers.com/`
- **Subdomain**: `qtech.in`
- **API Authentication**: Basic Auth (username: `brain`, password: `bitapi`)
- **App Authentication**: Web app credentials included in headers

## Features Implemented

### 1. Real Login Authentication
- **Login Endpoint**: `POST /api/auth/login`
- **Alternative Login**: `POST /api/auth/loginact` (account login)
- **Form Data**: Username (phone number) and password
- **Response**: Returns user information and API access token

### 2. Test Credentials
Available test credentials (as per Postman collection):
- **Primary**: `9898119868` / `superadmin`
- **Alternative**: `9924310757` / `superadmin`

### 3. User Information
The API returns comprehensive user information including:
- Full name, email, phone number
- Role (Company Administrator, etc.)
- Department information
- Employee ID and user ID
- API access token for subsequent requests

### 4. API Response Structure
```json
{
  "apiexec_status": "success",
  "usr_msg": "User Login Successful.",
  "logged_user": {
    "user_id": "1",
    "employee_id": "1",
    "full_name": "Chaitainya Purohit",
    "usertype_name": "Company Administrator",
    "api_access_token": "...",
    // ... more user details
  },
  "company": {
    "subdomain": "qtech.in",
    "client_id": "9"
  }
}
```

## Files Created/Modified

### New Files:
1. **`src/services/lazyLedgersAuthService.js`** - Main authentication service
2. **`test-api.js`** - Test script to verify API connectivity
3. **`LAZYLEDGERS_API_INTEGRATION.md`** - This documentation

### Modified Files:
1. **`src/Login.js`** - Updated to use LazyLedgers API
2. **`src/App.js`** - Updated authentication service import
3. **`src/Dashboard.js`** - Updated authentication service import

## How to Use

### 1. Start the Application
```bash
npm start
```

### 2. Login Process
1. Navigate to the login page
2. Use the test credential buttons to auto-fill:
   - Click "Admin User" to fill `9898119868` / `superadmin`
   - Click "Manager User" to fill `9924310757` / `superadmin`
3. Optionally check "Use Account Login" for the alternative endpoint
4. Click "Login"

### 3. API Testing
Run the test script to verify API connectivity:
```bash
node test-api.js
```

## API Endpoints Available

### Authentication:
- `POST /api/auth/login` - Standard login
- `POST /api/auth/loginact` - Account login
- `GET /api/auth/logout` - Logout

### Data Fetching:
- `GET /api/auth/fetchempmst/1` - Fetch employee master data
- `GET /api/company/fetch/0` - Fetch company information
- `GET /api/branch/fetch/0` - Fetch branch information
- `GET /admin/setting/view/app/0/google_api_key` - Fetch app settings

## Security Headers
All API requests include required headers:
- `Authorization`: Basic authentication
- `subdomain`: Company subdomain
- `app-auth-user`: App authentication username
- `app-auth-pwd`: App authentication password
- `app-os`: Platform identifier (web)
- `data-format`: Response format (j for JSON)
- `is-api-call`: API call identifier
- `user-access-token`: User session token (after login)

## Success Confirmation
✅ **API Connection**: Verified working with test credentials
✅ **Login Flow**: Successfully authenticates users
✅ **User Data**: Properly stores user information
✅ **Token Management**: Handles API access tokens
✅ **Error Handling**: Displays appropriate error messages

## Next Steps
1. The authentication is now working with the real LazyLedgers API
2. You can extend this to integrate other API endpoints as needed
3. Consider implementing additional features like employee location tracking using the API
4. Add proper error handling for network issues and API downtime

## Testing
The integration has been tested with:
- Valid credentials (successful login)
- API connectivity verification
- User data extraction and storage
- Token-based authentication flow

The application is now ready for use with the LazyLedgers API!
