import { BrowserRouter } from 'react-router-dom'
import RoutesApp from './routes/Routes'
import { OrdersProvider } from './context/OrdersContext'

function App() {
  return(
    <BrowserRouter>
      <OrdersProvider>
        <RoutesApp />
      </OrdersProvider>
    </BrowserRouter>
  )
}

export default App
