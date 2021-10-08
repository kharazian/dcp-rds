#!/bin/bash -a

PREFIX="/var/dcp-rds"

#### Package install
sudo useradd -d "${PREFIX}" -M -s /bin/false dcp-rds
sudo mkdir -p "${PREFIX}" 
sudo cp -r * "${PREFIX}"
sudo chown dcp-rds:dcp-rds "${PREFIX}"
sudo npm i ../dcp-rds --global --prefix="${PREFIX}"

#### Systemctl Integration
sed -e "s;/var/dcp-rds/;${PREFIX}/;" < "${PREFIX}/systemctl/dcp-rds.service" | sudo sh -c 'cat > /etc/systemd/system/dcp-rds.service'
sudo systemctl daemon-reload
sudo systemctl restart dcp-rds
