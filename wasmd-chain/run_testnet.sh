#!/usr/bin/env bash
set -x

BIN="wasmd"
OUT_DIR="testnet"
NODE_HOME="--home $OUT_DIR"
CID="--chain-id localnet"
KEYRING="--keyring-backend test"
STAKE="stake" # Bugs if not set to "stake"
ATOM="ucosm"
UUSD="uusd"
BLOCK_GAS_LIMIT="10000000"

VALIDATOR_MNEMONIC="satisfy adjust timber high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn"
TEST1_MNEMONIC="notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius"
TEST2_MNEMONIC="quality vacuum heart guard buzz spike sight swarm shove special gym robust assume sudden deposit grid alcohol choice devote leader tilt noodle tide penalty"
TEST3_MNEMONIC="symbol force gallery make bulk round subway violin worry mixture penalty kingdom boring survey tool fringe patrol sausage hard admit remember broken alien absorb"
TEST4_MNEMONIC="bounce success option birth apple portion aunt rural episode solution hockey pencil lend session cause hedgehog slender journey system canvas decorate razor catch empty"
TEST5_MNEMONIC="second render cat sing soup reward cluster island bench diet lumber grocery repeat balcony perfect diesel stumble piano distance caught occur example ozone loyal"
TEST6_MNEMONIC="spatial forest elevator battle also spoon fun skirt flight initial nasty transfer glory palm drama gossip remove fan joke shove label dune debate quick"
TEST7_MNEMONIC="noble width taxi input there patrol clown public spell aunt wish punch moment will misery eight excess arena pen turtle minimum grain vague inmate"
TEST8_MNEMONIC="cream sport mango believe inhale text fish rely elegant below earth april wall rug ritual blossom cherry detail length blind digital proof identify ride"
TEST9_MNEMONIC="index light average senior silent limit usual local involve delay update rack cause inmate wall render magnet common feature laundry exact casual resource hundred"
TEST10_MNEMONIC="prefer forget visit mistake mixture feel eyebrow autumn shop pair address airport diesel street pass vague innocent poem method awful require hurry unhappy shoulder"
rm -rf $OUT_DIR/
mkdir -p $OUT_DIR
# cd $OUT_DIR

$BIN $NODE_HOME $CID init node-main
# $BIN $NODE_HOME add-ica-config

GENESIS_FILE="$OUT_DIR"/config/genesis.json
# staking/governance token is hardcoded in config, change this
sed -i "s/\"stake\"/\"$STAKE\"/" "$GENESIS_FILE"
# this is essential for sub-1s block times (or header times go crazy)
sed -i 's/"time_iota_ms": "1000"/"time_iota_ms": "10"/' "$GENESIS_FILE"
# change gas limit to mainnet value
sed -i 's/"max_gas": "-1"/"max_gas": "'"$BLOCK_GAS_LIMIT"'"/' "$GENESIS_FILE"
# change default keyring-backend to test
sed -i 's/keyring-backend = "os"/keyring-backend = "test"/' "$OUT_DIR"/config/client.toml

APP_TOML_CONFIG="$OUT_DIR"/config/app.toml
APP_TOML_CONFIG_NEW="$OUT_DIR"/config/app_new.toml
CONFIG_TOML_CONFIG="$OUT_DIR"/config/config.toml
echo "Unsafe CORS set... updating app.toml and config.toml"
# sorry about this bit, but toml is rubbish for structural editing
sed -n '1h;1!H;${g;s/# Enable defines if the API server should be enabled.\nenable = false/enable = true/;p;}' "$APP_TOML_CONFIG" > "$APP_TOML_CONFIG_NEW"
mv "$APP_TOML_CONFIG_NEW" "$APP_TOML_CONFIG"
# ...and breathe
sed -i '' 's/enabled-unsafe-cors = false/enabled-unsafe-cors = true/' "$APP_TOML_CONFIG"
sed -i '' 's/cors_allowed_origins = \[\]/cors_allowed_origins = \[\"\*\"\]/' "$CONFIG_TOML_CONFIG"


# # Create accounts from known mnemonics
echo $VALIDATOR_MNEMONIC | $BIN $NODE_HOME keys add node-main-account --recover $KEYRING
echo $TEST1_MNEMONIC | $BIN $NODE_HOME keys add test1 --recover $KEYRING
echo $TEST2_MNEMONIC | $BIN $NODE_HOME keys add test2 --recover $KEYRING
echo $TEST3_MNEMONIC | $BIN $NODE_HOME keys add test3 --recover $KEYRING
echo $TEST4_MNEMONIC | $BIN $NODE_HOME keys add test4 --recover $KEYRING
echo $TEST5_MNEMONIC | $BIN $NODE_HOME keys add test5 --recover $KEYRING
echo $TEST6_MNEMONIC | $BIN $NODE_HOME keys add test6 --recover $KEYRING
echo $TEST7_MNEMONIC | $BIN $NODE_HOME keys add test7 --recover $KEYRING
echo $TEST8_MNEMONIC | $BIN $NODE_HOME keys add test8 --recover $KEYRING
echo $TEST9_MNEMONIC | $BIN $NODE_HOME keys add test9 --recover $KEYRING
echo $TEST10_MNEMONIC | $BIN $NODE_HOME keys add test10 --recover $KEYRING

# Fund accounts
$BIN $NODE_HOME add-genesis-account node-main-account "1000000000$STAKE,1000000000$ATOM,1000000000$UUSD" $KEYRING
$BIN $NODE_HOME add-genesis-account test1 "1000000000$STAKE,1000000000$ATOM,1000000000$UUSD" $KEYRING
$BIN $NODE_HOME add-genesis-account test2 "1000000000$STAKE,1000000000$ATOM,1000000000$UUSD" $KEYRING
$BIN $NODE_HOME add-genesis-account test3 "1000000000$STAKE,1000000000$ATOM,1000000000$UUSD" $KEYRING
$BIN $NODE_HOME add-genesis-account test4 "1000000000$STAKE,1000000000$ATOM,1000000000$UUSD" $KEYRING
$BIN $NODE_HOME add-genesis-account test5 "1000000000$STAKE,1000000000$ATOM,1000000000$UUSD" $KEYRING
$BIN $NODE_HOME add-genesis-account test6 "1000000000$STAKE,1000000000$ATOM,1000000000$UUSD" $KEYRING
$BIN $NODE_HOME add-genesis-account test7 "1000000000$STAKE,1000000000$ATOM,1000000000$UUSD" $KEYRING
$BIN $NODE_HOME add-genesis-account test8 "1000000000$STAKE,1000000000$ATOM,1000000000$UUSD" $KEYRING
$BIN $NODE_HOME add-genesis-account test9 "1000000000$STAKE,1000000000$ATOM,1000000000$UUSD" $KEYRING
$BIN $NODE_HOME add-genesis-account test10 "1000000000$STAKE,1000000000$ATOM,1000000000$UUSD" $KEYRING

# Validate genesis
$BIN $NODE_HOME $CID gentx node-main-account "250000000$STAKE" --amount="250000000$STAKE" $KEYRING
$BIN $NODE_HOME collect-gentxs
$BIN $NODE_HOME validate-genesis

$BIN $NODE_HOME start --rpc.laddr tcp://0.0.0.0:26657 --trace