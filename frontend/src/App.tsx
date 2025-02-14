import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.js'
import Login from './pages/Login.js'
import ResetPassword from './pages/ResetPassword.js'
import VerifyEmail from './pages/VerifyEmail.js'
import Dashboard from './pages/Dashboard.js'
import Profile from './pages/Profile.js'
const App = () => {
  return (
    <div className='text-4xl'>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/reset-password' element={<ResetPassword/>} />
        <Route path='/verify-email' element={<VerifyEmail/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/dashboard/profile' element={<Profile/>} />
      </Routes>
    </div>
  )
}

export default App
