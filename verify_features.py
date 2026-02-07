from playwright.sync_api import sync_playwright

def verify_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:8000")

        # Wait for loading screen to disappear
        page.wait_for_selector("#loadingScreen.hidden", state="attached")

        # 1. Verify Search Bar
        search_bar = page.wait_for_selector("#search-input")
        if search_bar.is_visible():
            print("Search bar is visible.")
        else:
            print("Error: Search bar not visible.")

        # 2. Click on a beach in the sidebar list (e.g., Kovalam)
        kovalam_card = page.wait_for_selector(".beach-card.popular:has-text('Kovalam Beach')")
        kovalam_card.click()

        # Wait for popup
        page.wait_for_selector(".leaflet-popup-content")
        print("Popup opened.")

        # 3. Verify Popup Content
        content = page.content()
        if "Best Time" in content and "Activities" in content:
            print("Popup contains new sections (Best Time, Activities).")
        else:
            print("Error: Popup missing new sections.")

        if "Add to Itinerary" in content:
            print("Popup contains 'Add to Itinerary' button.")
        else:
            print("Error: Popup missing itinerary button.")

        # Take screenshot of popup
        page.screenshot(path="verification_popup.png")
        print("Screenshot of popup saved to verification_popup.png")

        # 4. Click Add to Itinerary
        # Locate the button inside the popup
        itinerary_btn = page.locator(".leaflet-popup-content .itinerary-btn")
        itinerary_btn.click()

        # Wait for button text to change
        page.wait_for_function("document.querySelector('.itinerary-btn').textContent.includes('Remove')")
        print("Itinerary button toggled.")

        # 5. Verify Itinerary List in Sidebar
        itinerary_container = page.wait_for_selector("#itinerary-container")
        if itinerary_container.is_visible():
             print("Itinerary container is visible.")
        else:
             print("Error: Itinerary container not visible.")

        itinerary_item = page.wait_for_selector("#itinerary-list .beach-card:has-text('Kovalam Beach')")
        if itinerary_item.is_visible():
            print("Kovalam Beach added to itinerary list.")
        else:
            print("Error: Kovalam Beach not found in itinerary list.")

        # Take screenshot of sidebar with itinerary
        page.screenshot(path="verification_itinerary.png")
        print("Screenshot of sidebar saved to verification_itinerary.png")

        browser.close()

if __name__ == "__main__":
    verify_features()
