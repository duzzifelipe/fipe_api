This repository downloads every car data from FIPE's website API.

It follows the same idea from their website (filter sequences), but at this point you cannot set a reference month/year to check. I decided that the best option is to load it every single month to get a new FIPE reference.

The output is present in the folder `./output` within two `csv` files:
one for makes and another one for full car's description.

This project also makes use of a `tor` network to test it locally (and avoid any sort of problems), but it can be disabled by the simple use of a `DISABLE_TOR=true` environment variable.