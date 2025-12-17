// TODO > This state valid globally
const menuOpen = ref(false)

export const useMenu = () => {
  // TODO > This state valid for a single instance
  //   const menuOpen = ref(false)
  const toggleMenu = () => (menuOpen.value = !menuOpen.value)

  return {
    // TODO > you can still do "const {menuOpen} = useMenu()" anywhere
    menuOpen,
    toggleMenu,
  }
}
