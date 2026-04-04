    // SPDX-License-Identifier: BSD-3-Clause
    pragma solidity ^0.8.0;

    /// @title Test_d4e7_Escrow
    /// @dev Testnet version of NodeEscrow with constructor-based main contract address
    contract Test_d4e7_Escrow {
        bool public IS_NONCUSTODIAL_ESCROW = true;
        string public constant ESCROW_TYPE = "ERC721 Non-Custodial Escrow";
        address public NODE_MAIN_CONTRACT;
        
        uint256 private constant TIER3_END = 10800;
        uint256 private constant MAX_SUPPLY = 12000;

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

        function a1AddressEscrowHoldings(address addr) external view returns (
            address queryAddress,
            string memory queryAddressStatus,
            address relatedAddress1,
            string memory relatedAddress1Status,
            address relatedAddress2,
            string memory relatedAddress2Status,
            uint256 totalQty,
            uint256[] memory nodeIds,
            bool isPulled
        ) {
            (bool success, bytes memory data) = NODE_MAIN_CONTRACT.staticcall(
                abi.encodeWithSignature("a6AddressEscrowHoldings(address)", addr)
            );
            require(success, "Call failed");
            return abi.decode(data, (address, string, address, string, address, string, uint256, uint256[], bool));
        }

        function a3CurrentChainEscrowTotalHoldings() external view returns (uint256) {
            (bool success, bytes memory data) = NODE_MAIN_CONTRACT.staticcall(
                abi.encodeWithSignature("balanceOf(address)", address(this))
            );
            require(success, "Call failed");
            return abi.decode(data, (uint256));
        }

        function a4RemainingNodesToReleaseEscrow() external view returns (uint256) {
            (bool success1, bytes memory data1) = NODE_MAIN_CONTRACT.staticcall(
                abi.encodeWithSignature("isWhitelistNetwork()")
            );
            require(success1, "Call failed");
            bool isWhitelistNetwork = abi.decode(data1, (bool));

            (bool success2, bytes memory data2) = NODE_MAIN_CONTRACT.staticcall(
                abi.encodeWithSignature("a3GetTotalCurrentSupply()")
            );
            require(success2, "Call failed");
            uint256 totalSupply = abi.decode(data2, (uint256));

            if (isWhitelistNetwork) {
                (bool success3, bytes memory data3) = NODE_MAIN_CONTRACT.staticcall(
                    abi.encodeWithSignature("whitelistMintedCount()")
                );
                require(success3, "Call failed");
                uint256 whitelistMinted = abi.decode(data3, (uint256));
                return (totalSupply - whitelistMinted >= TIER3_END) ? 0 : TIER3_END - (totalSupply - whitelistMinted);
            } else {
                return (totalSupply >= MAX_SUPPLY) ? 0 : MAX_SUPPLY - totalSupply;
            }
        }

        function a2EscrowStatus() public view returns (string memory) {
            uint256 remainingNodes = this.a4RemainingNodesToReleaseEscrow();
            (bool success2, bytes memory data2) = NODE_MAIN_CONTRACT.staticcall(
                abi.encodeWithSignature("balanceOf(address)", address(this))
            );
            require(success2, "Call failed");
            uint256 currentBalance = abi.decode(data2, (uint256));

            if (remainingNodes > 0) {
                return "not released yet";
            } else if (currentBalance > 0) {
                return "pulling window is open";
            } else {
                return "all nodes are already pulled";
            }
        }
    }
