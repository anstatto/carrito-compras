declare module '@stripe/stripe-js' {
  import { Stripe, loadStripe as _loadStripe } from '@stripe/stripe-js'
  export { Stripe }
  export const loadStripe: typeof _loadStripe
}

declare module '@stripe/react-stripe-js' {
  import { 
    Elements,
    useStripe,
    useElements,
    PaymentElement
  } from '@stripe/react-stripe-js'
  
  export {
    Elements,
    useStripe,
    useElements,
    PaymentElement
  }
} 