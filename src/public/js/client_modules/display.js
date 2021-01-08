// Controls what html elements are displayed
export class Display {
	constructor(homeElements, gameElements, overlayMenu, overlayTimer) {
		this.homeElements = homeElements
		this.gameElements = gameElements
		this.overlayMenu = overlayMenu
		this.overlayTimer = overlayTimer
	}
	setDisplay(elementArray, displayType) {
		for (let i = 0; i < elementArray.length; i++) {
			elementArray[i].style.display = displayType
		}
	}
	showHome() {
		this.setDisplay(this.gameElements, "none")
		this.setDisplay(this.homeElements, "block")
	}
	showGame() {
		this.setDisplay(this.homeElements, "none")
		this.setDisplay(this.gameElements, "block")
	}
	showOverlayMenu() {
		this.overlayMenu.style.display = "block"
	}
	hideOverlayMenu() {
		this.overlayMenu.style.display = "none"
	}
}
