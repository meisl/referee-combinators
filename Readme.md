# referee-combinators

"Combinators goes assertion" (or was it the other way round?)

We'll use the latest referee from github, NOT the one on npm. Like so:
```
git clone https://github.com/busterjs/referee-combinators.git
cd referee-combinators
mkdir node_modules
git clone https://github.com/busterjs/referee.git node_modules/referee
npm install
PATH=`pwd`/node_modules/.bin:$PATH
```
