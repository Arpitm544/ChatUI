import { Link } from 'react-router-dom'

const Switch = ({ type }) => {
  return (
    <div className="text-center mt-3">
      {type === "login" ? (
        <Link to="/signup" className="text-blue-700 hover:underline hover:text-blue-900">
          Don't have an account? Signup
        </Link>
      ) : (
        <Link to="/login" className="text-blue-700 hover:underline hover:text-blue-900">
          Already have an account? Login
        </Link>
      )}
    </div>
  )
}

export default Switch