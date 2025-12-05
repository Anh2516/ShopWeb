// Utility để debug Redux state
export const logReduxState = (state, label = 'Redux State') => {
  console.group(label);
  console.log('Products:', state.products);
  console.log('Auth:', state.auth);
  console.log('Cart:', state.cart);
  console.groupEnd();
};

// Utility để debug API response
export const logAPIResponse = (response, label = 'API Response') => {
  console.group(label);
  console.log('Status:', response.status);
  console.log('Data:', response.data);
  console.groupEnd();
};

