import Home from './pages/home/Home'
import { HomeContextProvider } from './pages/home/HomeContext'

function App() {
  return (
    <HomeContextProvider>
      <Home />
    </HomeContextProvider>
  )
}

export default App
