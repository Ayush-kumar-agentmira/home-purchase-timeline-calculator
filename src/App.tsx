import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import HomePurchase from './HomePurchase'
import HomePurchase1 from './HomePurchase1'
import HomePurchaseComparison from './HomePurchaseComparison'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <HomePurchase />
      {/* <HomePurchase1 /> */}
      {/* <HomePurchaseComparison /> */}
        
    </>
  )
}

export default App
