const VERCEL_BACKEND_URL = 'https://truefans-backend.vercel.app';

// Call backend to generate pass
const response = await axios.post(`${VERCEL_BACKEND_URL}/api/digital-passes/generate`, {
  name: form.name,
  phone: form.phone,
  birthday: form.birthday,
  restaurantId
}); 