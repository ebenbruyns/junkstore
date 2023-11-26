#!/bin/bash
echo 'out/${config:pluginname}.zip' && 
sudo cp \"out/${config:pluginname}.zip\" \"$(echo \"~/homebrew/plugins/\" | sed \"s| |-|\")\" && 
sudo -S mkdir 755 -p \"$(echo \"~/homebrew/plugins/${config:pluginname}\" | sed \"s| |-|\")\" && 
sudo -S chown ${config:deckuser}:${config:deckuser} \"$(echo \"~/homebrew/plugins/${config:pluginname}\" | sed \"s| |-|\")\" &&  
sudo -S bsdtar -xzpf \"~/homebrew/plugins/${config:pluginname}.zip\" -C \"$(echo \"~/homebrew/plugins/${config:pluginname}\" | 
sed \"s| |-|g\")\" --strip-components=1 --fflags