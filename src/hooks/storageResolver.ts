const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const storage = (url:string) => {
  
    return `${API_BASE_URL}/${url}`
}

export { storage };