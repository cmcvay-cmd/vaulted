// context/StoreContext.js — real cart, persisted to localStorage
'use client'
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'

const Ctx = createContext(null)
const LS_CART = 'vaulted_cart_v1'
const LS_VISITOR = 'vaulted_visitor_v1'

function reducer(state, a) {
  switch (a.type) {
    case 'hydrate': return a.items
    case 'add': {
      const ex = state.find((x) => x.id === a.product.id)
      if (ex) return state.map((x) => (x.id === a.product.id ? { ...x, qty: x.qty + 1 } : x))
      const { id, title, brand, price_usd, grade, art, image_url } = a.product
      return [...state, { id, title, brand, price_usd, grade, art, image_url, qty: 1 }]
    }
    case 'qty': return state.map((x) => (x.id === a.id ? { ...x, qty: Math.max(1, x.qty + a.d) } : x))
    case 'remove': return state.filter((x) => x.id !== a.id)
    case 'clear': return []
    default: return state
  }
}

export function StoreProvider({ children }) {
  const [cart, dispatch] = useReducer(reducer, [])
  const [visitorId, setVisitorId] = useState('')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_CART)
      if (raw) dispatch({ type: 'hydrate', items: JSON.parse(raw) })
    } catch {}
    let v = localStorage.getItem(LS_VISITOR)
    if (!v) { v = crypto.randomUUID(); localStorage.setItem(LS_VISITOR, v) }
    setVisitorId(v)
    setHydrated(true)
  }, [])

  useEffect(() => { if (hydrated) localStorage.setItem(LS_CART, JSON.stringify(cart)) }, [cart, hydrated])

  const value = useMemo(
    () => ({ cart, dispatch, visitorId, hydrated, count: cart.reduce((a, x) => a + x.qty, 0) }),
    [cart, visitorId, hydrated]
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export const useStore = () => useContext(Ctx)