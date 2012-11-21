rm -rf keys
mkdir keys
openssl genrsa -out keys/key.pem 1024 
openssl req -new -key keys/key.pem -out keys/cert.csr 
openssl x509 -req -in keys/cert.csr -signkey keys/key.pem -out keys/cert.pem
rm keys/cert.csr
