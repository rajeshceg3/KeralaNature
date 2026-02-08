from playwright.sync_api import sync_playwright

def verify_fixes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # --- Test 1: Map Keyboard Navigation ---
        print("\n--- Testing Map Keyboard Navigation ---")
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        page.goto("http://localhost:8000")
        page.wait_for_selector("#loadingScreen.hidden", state="attached")

        # Focus map container
        page.evaluate("document.getElementById('map').focus()")

        # Check active element
        active_id = page.evaluate("document.activeElement.id")
        print(f"Active element ID: {active_id}")

        if active_id == 'map':
            print("Map container focused.")
        else:
            print(f"FAILURE: Map container not focused. Active: {active_id}")

        # Get initial center
        initial_center = page.evaluate("map.getCenter()")
        print(f"Initial Center: {initial_center}")

        # Press ArrowRight
        page.keyboard.press("ArrowRight")
        page.wait_for_timeout(1000) # Wait for animation

        # Get new center
        new_center = page.evaluate("map.getCenter()")
        print(f"New Center: {new_center}")

        if initial_center['lng'] != new_center['lng']:
            print("SUCCESS: Map panned with keyboard.")
        else:
            print("FAILURE: Map did not pan with keyboard.")


        # --- Test 2: Focus Trap in Modals ---
        print("\n--- Testing Focus Trap in Modals ---")
        try:
            # Open popup
            page.locator(".beach-card").first.click()
            page.wait_for_selector(".leaflet-popup-content", timeout=5000)

            # Click View Memories
            page.locator(".view-memories-btn").click()
            page.wait_for_selector("#photo-gallery", state="visible")

            # Wait for focus to move inside modal
            try:
                page.wait_for_function("document.getElementById('photo-gallery').contains(document.activeElement)", timeout=2000)
                print("SUCCESS: Focus moved inside modal.")
            except:
                print("FAILURE: Focus did not move inside modal within timeout.")
                print(f"Active Element: {page.evaluate('document.activeElement.tagName')}")

            # Close modal
            page.keyboard.press("Escape")
            page.wait_for_selector("#photo-gallery", state="hidden")

            # Check if focus returned (optional but good)
            # It might return to body or trigger button.

        except Exception as e:
            print(f"Test 2 Error: {e}")

        context.close()

        # --- Test 3: Mobile Itinerary Interaction ---
        print("\n--- Testing Mobile Itinerary Interaction ---")
        mobile_context = browser.new_context(viewport={"width": 375, "height": 667}, is_mobile=True)
        mobile_page = mobile_context.new_page()
        mobile_page.goto("http://localhost:8000")
        mobile_page.wait_for_selector("#loadingScreen.hidden", state="attached")

        # Add to itinerary via JS
        mobile_page.evaluate("toggleItinerary('Kovalam Beach')")

        # Check pointer events
        itinerary_pointer_events = mobile_page.evaluate("window.getComputedStyle(document.getElementById('itinerary-container')).pointerEvents")
        print(f"Itinerary container pointer-events: {itinerary_pointer_events}")

        if itinerary_pointer_events == 'auto':
             print("SUCCESS: Itinerary container has pointer-events: auto.")
        else:
             print("FAILURE: Itinerary container pointer-events is NOT auto.")

        # Try to click
        try:
             mobile_page.locator("#itinerary-list .beach-card").first.click(timeout=5000)
             print("Clicked itinerary item.")

             # Check for bottom sheet
             sheet_visible = mobile_page.is_visible("#infoPanel.expanded")
             if sheet_visible:
                 print("SUCCESS: Bottom sheet opened.")
             else:
                 print("FAILURE: Bottom sheet did not open.")

        except Exception as e:
            print(f"FAILURE: Could not click itinerary item: {e}")

        mobile_context.close()
        browser.close()

if __name__ == "__main__":
    verify_fixes()
