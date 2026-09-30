# Enrolling a tablet

Plain-language steps for adding a Samsung Galaxy Tab A11 to the Preform dashboard. Enrolling **erases
everything on the tablet**.

You need:
- The tablet, charged to at least 50%.
- A computer or phone showing the dashboard at <https://thefunctionhub.netlify.app>.
- The Wi-Fi name and password, unless you put them in the QR code.

## 1. Prepare the tablet (before the reset)

Skip this if the tablet is brand new.

1. **Remove every account.** Go to **Settings → Accounts and backup → Manage accounts**. Tap each Google
   and Samsung account → **Remove account**.
   *Why:* if an account is still on the tablet, it asks for that account's password after the reset and
   won't enroll.
2. **Factory reset.** Go to **Settings → General management → Reset → Factory data reset → Reset**.
   Enter the PIN, then tap **Delete all**. The tablet restarts to the welcome screen.

## 2. Make the QR code

1. In the dashboard, open **Enroll**.
2. **Policy:** `maintenance` for a test tablet. Use a kiosk policy once the rollout starts.
3. **Tablet name:** e.g. `Site 3 – Tablet 1`. With a name, the code works for that one tablet only, and
   the name shows on the Devices page.
4. Optionally tick **Include Wi-Fi** and enter the network. The tablet then connects by itself.
5. Click **Create QR code**. Don't share, print or photograph the code. It lets a tablet join your
   company, and it may contain the Wi-Fi password.

## 3. Enroll

1. On the tablet's first **welcome screen**, **tap the same empty spot 6 times** quickly. Aim for a blank
   area, not a button.
2. A QR setup screen opens. If the tablet asks for Wi-Fi first to download the scanner, connect.
3. Point the tablet's camera at the QR code on your screen.
4. If the code had no Wi-Fi in it, choose the network and enter the password.
5. The tablet says it **belongs to your organisation**. Tap **Accept & continue** / **Next** through the
   screens. It downloads Google's *Android Device Policy* app and applies the policy, which can take a
   few minutes.
6. When asked, set a **screen lock PIN of at least 6 digits**.
7. In the dashboard, open **Devices** and click **Refresh**. The tablet appears within a few minutes.

**If tapping 6 times does nothing:** make sure you're on the very first welcome screen, and tap a blank
area rather than the text. As a fallback, go forward to the screen that asks you to sign in with a
Google account and type `afw#setup` as the email address. This installs Android Device Policy, which
then lets you choose **QR code**.

## 4. Getting a tablet out of kiosk mode

**The tablet is online (normal case)**
1. In the dashboard, open **Devices**, find the tablet, and change its policy to **maintenance**.
2. Within a minute or two it unlocks into a normal home screen. Do your work.
3. Switch it back to its kiosk policy when you're done.

A tablet only receives changes while it has internet. If it doesn't respond:
- Restart it by holding the power button. It reconnects to its saved Wi-Fi.
- Workers can still change Wi-Fi on the tablet, so connect it to a network that works.
- Check **Last seen** on the Devices page to confirm it has checked in.

**Forgotten PIN:** in the dashboard, use **Reset PIN** on the tablet and enter a new PIN of 6 digits or
more.

**Last resort: the tablet never comes online again.** Resetting from Settings is blocked by the policy,
but Samsung's recovery-mode reset still works. The key combination varies by model; for most Samsung
tablets, switch it off, then hold **Volume Up + Power** (on some models with a USB cable connected to a
computer) and choose **Wipe data/factory reset**. The tablet may then ask for the company recovery
Google account before it can be set up again. After that, enroll it again from step 2.

## Removing a tablet for good

In **Devices**, choose **Wipe**, then type the tablet's serial number to confirm. The tablet is erased
and removed from the dashboard.
