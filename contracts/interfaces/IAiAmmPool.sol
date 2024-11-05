// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

import './pool/IAiAmmPoolImmutables.sol';
import './pool/IAiAmmPoolState.sol';
import './pool/IAiAmmPoolDerivedState.sol';
import './pool/IAiAmmPoolActions.sol';
import './pool/IAiAmmPoolOwnerActions.sol';
import './pool/IAiAmmPoolEvents.sol';

/// @title The interface for a Uniswap V3 Pool
/// @notice A Uniswap pool facilitates swapping and automated market making between any two assets that strictly conform
/// to the ERC20 specification
/// @dev The pool interface is broken up into many smaller pieces
interface IAiAmmPool is
    IAiAmmPoolImmutables,
    IAiAmmPoolState,
    IAiAmmPoolDerivedState,
    IAiAmmPoolActions,
    IAiAmmPoolOwnerActions,
    IAiAmmPoolEvents
{

}
