    // SPDX-License-Identifier: BSD-3-Clause
    pragma solidity ^0.8.0;

    /// @title Test_d4e7_Bridge
    /// @dev Testnet version of BridgeEscrow with constructor-based main contract address
    contract Test_d4e7_Bridge {
        bool public IS_CROSSCHAIN_ESCROW = true;
        string public constant ESCROW_TYPE = "ERC721 Bridge Escrow";
        address public NODE_MAIN_CONTRACT;

        constructor(address _mainContract) {
            require(_mainContract != address(0), "Invalid main contract");
            NODE_MAIN_CONTRACT = _mainContract;
        }

        function onERC721Received(
            address,
            address,
            uint256,
            bytes calldata
        ) external view returns (bytes4) {
            require(msg.sender == NODE_MAIN_CONTRACT, "Only main contract can interact");
            return 0x150b7a02;
        }

        function a1EthereumSupply() public view returns (uint256) {
            (bool success1, bytes memory data1) = NODE_MAIN_CONTRACT.staticcall(
                abi.encodeWithSignature("isWhitelistNetwork()")
            );
            require(success1, "Network check failed");
            bool isWhitelistNetwork = abi.decode(data1, (bool));

            if (isWhitelistNetwork) {
                (bool success2, bytes memory data2) = NODE_MAIN_CONTRACT.staticcall(
                    abi.encodeWithSignature("a2OtherChainsTnftSupply()")
                );
                require(success2, "Supply check failed");
                return abi.decode(data2, (uint256));
            } else {
                (bool success2, bytes memory data2) = NODE_MAIN_CONTRACT.staticcall(
                    abi.encodeWithSignature("a1CurrentChainTnftSupply()")
                );
                require(success2, "Supply check failed");
                return abi.decode(data2, (uint256));
            }
        }

        function a2FlareSupply() public view returns (uint256) {
            (bool success1, bytes memory data1) = NODE_MAIN_CONTRACT.staticcall(
                abi.encodeWithSignature("isWhitelistNetwork()")
            );
            require(success1, "Network check failed");
            bool isWhitelistNetwork = abi.decode(data1, (bool));

            if (isWhitelistNetwork) {
                (bool success2, bytes memory data2) = NODE_MAIN_CONTRACT.staticcall(
                    abi.encodeWithSignature("a1CurrentChainTnftSupply()")
                );
                require(success2, "Supply check failed");
                return abi.decode(data2, (uint256));
            } else {
                (bool success2, bytes memory data2) = NODE_MAIN_CONTRACT.staticcall(
                    abi.encodeWithSignature("a2OtherChainsTnftSupply()")
                );
                require(success2, "Supply check failed");
                return abi.decode(data2, (uint256));
            }
        }
    }
