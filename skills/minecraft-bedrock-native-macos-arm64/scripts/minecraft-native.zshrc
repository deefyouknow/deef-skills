export PATH="$HOME/bin:/opt/homebrew/bin:$PATH"

alias mc='mc-native'
alias mcstop='mc-native stop'
alias mcclean='mc-native clean'
alias mcstatus='mc-native status'

PROMPT='[MC-Native] %~ %# '

echo "Minecraft Native shell"
echo "  mc       start in foreground"
echo "  Ctrl+C   stop + cleanup"
echo "  mcstop   force cleanup stale client"
echo "  mcstatus show running client"
