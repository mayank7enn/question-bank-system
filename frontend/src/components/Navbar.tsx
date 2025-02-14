import { assets } from '../assets/assets'
import { useNavigate } from 'react-router'

const Navbar = () => {

  const navigate = useNavigate()
  
  return (
    <div className='flex justify-between items-center p-4 bg-gray-200 text-white fixed top-0 w-full'>
        <img src={assets.logo} alt="" className='w-20 sm:w-24 md:w-28 lg:w-32'/>
        <button onClick={()=>{navigate('/login')}} className='text-xs text-black border-1 sm:text-sm md:text-base lg:text-lg xl:text-xl bg-gray-200 hover:bg-gray-300 font-bold py-2 px-4 rounded-xl transition duration-200 ease-in-out' style={{ color: 'black' }}>
          Login
        </button>
    </div>
  )
}

export default Navbar