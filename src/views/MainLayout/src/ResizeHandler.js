export default {
  data() {
    const device = this.getDevice()
    return {
      device: device
    }
  },
  beforeMount() {
    window.addEventListener('resize', _.debounce(this.getDevice, 150, {
      'maxWait': 300
    }))
  },
  methods: {
    getDevice() {
      let device = "mobile"
      const width = document.body.getBoundingClientRect().width
      if (width >= 1200) device = "desktop"
      else if (width > 768) device = "laptop"
      this.device = device
      if (this.allMenuVisable) {
        this.closeMenu()
      }
      return device
    }
  }
}