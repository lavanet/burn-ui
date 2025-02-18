export const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    return `${year} ${month}`
}

export const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']
    const month = months[date.getMonth()]
    const day = date.getDate()
    return `${month} ${day}, ${year}`
} 