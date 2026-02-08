from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Desktop Map & Popup
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        page.goto("http://localhost:8000")
        page.wait_for_selector("#loadingScreen.hidden", state="attached")

        # Open a popup to show the fix in action (or just show the UI)
        page.locator(".beach-card").first.click()
        page.wait_for_selector(".leaflet-popup-content")
        page.screenshot(path="/home/jules/verification/desktop_popup.png")
        print("Captured desktop_popup.png")

        # Open Photo Gallery to show modal
        page.locator(".view-memories-btn").click()
        page.wait_for_selector("#photo-gallery", state="visible")
        # Wait a bit for animation
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/modal_focus_trap.png")
        print("Captured modal_focus_trap.png")

        context.close()

        # 2. Mobile Itinerary
        mobile_context = browser.new_context(viewport={"width": 375, "height": 667}, is_mobile=True)
        mobile_page = mobile_context.new_page()
        mobile_page.goto("http://localhost:8000")
        mobile_page.wait_for_selector("#loadingScreen.hidden", state="attached")

        # Add to itinerary
        mobile_page.evaluate("toggleItinerary('Kovalam Beach')")

        # Take screenshot of mobile view showing itinerary list
        mobile_page.screenshot(path="/home/jules/verification/mobile_itinerary_list.png")
        print("Captured mobile_itinerary_list.png")

        # Click itinerary item
        try:
             mobile_page.locator("#itinerary-list .beach-card").first.click()
             mobile_page.wait_for_selector("#infoPanel.expanded")
             mobile_page.wait_for_timeout(500)
             mobile_page.screenshot(path="/home/jules/verification/mobile_bottom_sheet.png")
             print("Captured mobile_bottom_sheet.png")
        except Exception as e:
            print(f"Failed to capture mobile bottom sheet: {e}")

        mobile_context.close()
        browser.close()

if __name__ == "__main__":
    verify_frontend()
