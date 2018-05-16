open_page() {
    # Hackey check for linux system for proper wep page open command
    # (assumes Mac OS otherwise)
    if [ $(uname) == "Linux" ]
    then
        xdg-open http://127.0.0.1:8000/index.html &
        xdg-open http://127.0.0.1:8000/control.html &
    else
        open http://127.0.0.1:8000/index.html &
        open http://127.0.0.1:8000/control.html &
    fi
}

# Launch processing
processing-java  --sketch="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )" --output=/tmp/processing --force --run &
# Wait 2 seconds then open page
sleep 2 && open_page
