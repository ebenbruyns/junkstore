#!/bin/bash
DOWNLOAD_LOCATION=https://github.com/ebenbruyns/legendary-flatpak/releases/latest/download/legendary.flatpak
function uninstall() {
    echo "Uninstalling flatpaks"
    if flatpak list | grep -q "com.github.derrod.legendary"; then
        echo "legendary flatpak is installed, removing"
        flatpak --user uninstall com.github.derrod.legendary -y
    fi
    if flatpak list | grep -q "com.github.Matoking.protontricks"; then
        echo "protontricks flatpak is installed, removing"
        flatpak --user uninstall com.github.Matoking.protontricks -y
    fi
    echo "Removing unused flatpaks"
    flatpak --user uninstall --unused -y
}

function download_and_install() {
    cd /tmp
    flatpak remote-add --user --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
    flatpak --user install flathub org.gnome.Platform//45 -y
    flatpak --user install com.github.Matoking.protontricks -y
    wget $DOWNLOAD_LOCATION
    flatpak --user install legendary.flatpak -y
    rm legendary.flatpak
}

function install() {
    if flatpak list | grep -q "com.github.derrod.legendary"; then
        echo "legendary flatpak is installed, removing and reinstalling"
        flatpak --user uninstall com.github.derrod.legendary -y    
    fi
    download_and_install
}

if [ "$1" == "uninstall" ]; then
    echo "Uninstalling dependencies: Epic extension"
    uninstall
else
    echo "Installing dependencies: Epic extension"
    install
fi