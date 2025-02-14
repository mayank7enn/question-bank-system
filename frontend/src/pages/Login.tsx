import { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { appContext } from '../context/appContext'
import axios from 'axios'

const Login = () => {
  const context = useContext(appContext)
  if (!context) {
    throw new Error("appContext must be used within a AppProvider")
  }

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    console.log("Submitting:", { name, email, password });
  
    try {
      axios.defaults.withCredentials = true;
  
      const endpoint = state === "Sign Up" ? "/api/auth/register" : "/api/auth/login";
      const payload = state === "Sign Up" ? { name, email, password } : { email, password };
  
      console.log("Sending request to:", context.backendUrl + endpoint);
      console.log("Payload:", payload);
  
      const response = await axios.post(context.backendUrl + endpoint, payload);
  
      console.log("Response received:", response);
  
      if (response.data.success) {
        console.log("Login successful, redirecting...");
        console.log(response)
        context.setIsLoggedIn(true);
        context.setName(response.data.user.name);
        navigate("/dashboard"); // Navigate to the dashboard page
      } else {
        console.warn("Backend response error:", response.data);
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Axios Error:", error);
  
      // If the backend sends a structured error response, show it
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error Response Data:", error.response.data);
        alert(error.response.data.message || "An unknown error occurred");
      } else {
        alert(error instanceof Error ? error.message : "An unknown error occurred");
      }
    }
  };
  
  return (
    <div className='flex flex-col items-center justify-center h-screen p-4'>
      <img 
        onClick={() => navigate('/')}
        src={assets.logo} 
        alt='' 
        className='absolute left-5 sm:left-20 top-5 sm:w-32 w-16 cursor-pointer'
      />

      <div className='text-center'>
        <h2 className='text-lg sm:text-2xl mb-4'>{state === 'Sign Up' ? 'Create Account' : 'Log in'}</h2>
        
        <form 
          onSubmit={onSubmitHandler}
          className='mt-4 w-5d6 sm:w-64 mx-auto text-sm sm:text-base'
        >
            {state === 'Sign Up' && (
            <div className='flex items-center border-b border-gray-300 py-2 w-72 sm:w-96 mx-auto'>
              <img src={assets.person_icon} alt='' className='w-6 h-6 mr-2'/>
              <input 
              onChange={(e) => setName(e.target.value)}
              value={name}
              type='text' 
              placeholder='Name' 
              required 
              className='appearance-none bg-transparent border-none w-full text-gray-700 py-1 px-2 leading-tight focus:outline-none text-xs sm:text-sm'
              />
            </div>
            )}
          
          <div className='flex items-center border-b border-gray-300 py-2 w-72 sm:w-96 mx-auto'>
            <img src={assets.mail_icon} alt='' className='w-6 h-6 mr-2'/>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email} 
              type='email' 
              placeholder='E-mail' 
              required 
              className='appearance-none bg-transparent border-none w-full text-gray-700 py-1 px-2 leading-tight focus:outline-none text-xs sm:text-sm'
            />
          </div>
          
          <div className='flex items-center border-b border-gray-300 py-2 w-72 sm:w-96 mx-auto'>
            <img src={assets.lock_icon} alt='' className='w-6 h-6 mr-2'/>
            <input 
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type='password' 
              placeholder='Password' 
              required 
              className='appearance-none bg-transparent border-none w-full text-gray-700 py-1 px-2 leading-tight focus:outline-none text-xs sm:text-sm'
            />
          </div>
          
          <div className='flex justify-between items-center w-72 sm:w-96 mx-auto mt-2'>
            <button
              className='text-xs sm:text-sm text-gray-500 cursor-pointer hover:underline text-left' 
              onClick={() => navigate('/reset-password')}
            >
              Forgot Password?
            </button>
          </div>
          
          <button 
            type='submit' 
            className='bg-black text-white py-2 px-4 rounded-xl mt-4 w-72 sm:w-96 mx-auto'
          >
            {state}
          </button>
          
          <button 
            className='text-xs sm:text-sm text-gray-500 cursor-pointer hover:underline text-right' 
            onClick={() => setState(state === 'Sign Up' ? 'Log In' : 'Sign Up')}
          >
            {state === 'Sign Up' ? ('Already have an account? Login here') : ('Create an account')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
