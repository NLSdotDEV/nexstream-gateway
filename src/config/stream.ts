/**
 * Fallback Screen Configuration
 *
 * These screen URLs (pointing to MP4 video screens or m3u8 placeholder streams)
 * are returned when playback cannot be completed due to business logic errors.
 * The associated error codes are displayed on the client player UI.
 */

const streamFallbackConfig = {
  // Code: ERR-500 - All connections are currently busy. Please wait a moment and try again.
  no_mac_found_screen:
    "https://www.dropbox.com/scl/fi/ggmcfshsm5dzp4ed5c01q/km_no_mac_found_scree_1080p_60f_20260628_032316.mp4?rlkey=4110s6wx5rrzad1knw8o5qa6j&st=jf7b8ubx&dl=1",
  // Code: ERR-501 - The channel server is currently undergoing maintenance. Please try again shortly.
  inactive_server_screen:
    "https://www.dropbox.com/scl/fi/r2hxxsh0a81x242twl4t7/km_inactive_server_screen_1080p_60f_20260628_032637.mp4?rlkey=u1cfaxw8p7f1pwxexegc6vzuf&st=ox6m3iz5&dl=1",

  // Code: ERR-502 - This stream is active on another device. Please close other sessions or wait a moment.
  concurrent_stream_screen:
    "https://www.dropbox.com/scl/fi/ucgi335did4g87o6i1c0v/km_concurrent_stream_screen_1080p_60f_20260628_033048.mp4?rlkey=3fts0r2b95jfhr4hz67fy70rx&st=dyzd5mee&dl=1",

  // Code: ERR-403 - Your subscription has expired. Please renew your plan or contact support.
  subscription_expired_screen:
    "https://www.dropbox.com/scl/fi/0tw1quaiwq1hc3jwb6nqk/km_expired_subscription_screen_1080p_60f_20260628_033538.mp4?rlkey=801rxle6bds1867njm4yhf8gq&st=0lh87z5p&dl=1",

  // Code: ERR-404 - The requested channel is currently unavailable. Please try another channel or wait.
  stream_not_found_screen:
    "https://www.dropbox.com/scl/fi/yvwtdg65r9xxrdctkuu95/km_stream_not_found_screen_1080p_60f_20260628_034412.mp4?rlkey=4v7n86776f0n601eyerutubhk&st=hjcr7t66&dl=1",

  // Code: ERR-451 - Your account is temporarily suspended. Please contact support.
  subscription_blocked_screen:
    "https://www.dropbox.com/scl/fi/msy62czurd2sfndanchtd/km_subscription_blocked_screen_1080p_60f_20260628_035114.mp4?rlkey=n8ftq62arczwxuasekkxr1uvy&st=8br1f31k&dl=1",

  // Code: ERR-504 - Unable to load stream. Please wait a moment while we reconnect.
  unplayable_stream_screen:
    "https://www.dropbox.com/scl/fi/dkbnz1ggnlf4oy8m3c0hv/km_unplayable_stream_screen_1080p_60f_20260628_035416.mp4?rlkey=7jvomrix0eo313o6qa2n58baj&st=s1zq6c4i&dl=1",
};


export {streamFallbackConfig}