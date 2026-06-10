```javascript
import axios from "axios";

export async function validatePiAccessToken(accessToken) {
  try {
    const response = await axios.get("https://api.minepi.com/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data; 
  } catch (error) {
    return null;
  }
}
```
