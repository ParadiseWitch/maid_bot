export const delay = async (time: number): Promise<void> => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res()
    }, time)
  })
}
