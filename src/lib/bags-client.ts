/**
 * Bags.fm Launchpad Integration Client
 * 
 * Integration with Bags.fm for token launches and bonding curve tracking
 * Docs: https://docs.bags.fm/
 */

const BAGS_API_BASE = process.env.NEXT_PUBLIC_BAGS_API_URL || 'https://public-api-v2.bags.fm/api/v1';

interface BagsApiOptions {
  apiKey?: string;
}

/**
 * Get Bags API headers
 */
function getBagsHeaders(apiKey?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  
  return headers;
}

/**
 * Bonding Curve Status Interface
 */
export interface BondingCurveStatus {
  tokenAddress: string;
  isMigrated: boolean;
  marketCap: number;
  bondingCurveProgress: number;
  liquidityPool: string | null;
  canMigrate: boolean;
  holders: number;
  volume24h: number;
}

/**
 * Token Launch Info Interface
 */
export interface TokenLaunchInfo {
  address: string;
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  creator: string;
  marketCap: number;
  price: number;
  volume24h: number;
  bondingCurveProgress: number;
  migrated: boolean;
  createdAt: string;
}

/**
 * Migration Check Result
 */
export interface MigrationCheckResult {
  tokenAddress: string;
  ready: boolean;
  alreadyMigrated: boolean;
  progress: number;
  remainingProgress: number;
  marketCap: number;
  estimatedLiquidityPool: string | null;
  message: string;
}

export const BagsClient = {
  /**
   * Check bonding curve status
   */
  async checkBondingCurve(
    tokenAddress: string,
    options?: BagsApiOptions
  ): Promise<BondingCurveStatus> {
    const response = await fetch(`${BAGS_API_BASE}/tokens/${tokenAddress}`, {
      headers: getBagsHeaders(options?.apiKey),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch bonding curve status');
    }
    
    const data = await response.json();
    
    return {
      tokenAddress,
      isMigrated: data.migrated || false,
      marketCap: data.marketCap || 0,
      bondingCurveProgress: data.bondingCurveProgress || 0,
      liquidityPool: data.liquidityPool || null,
      canMigrate: data.bondingCurveProgress >= 100,
      holders: data.holders || 0,
      volume24h: data.volume24h || 0,
    };
  },

  /**
   * Get token launch information
   */
  async getTokenInfo(
    tokenAddress: string,
    options?: BagsApiOptions
  ): Promise<TokenLaunchInfo> {
    const response = await fetch(`${BAGS_API_BASE}/tokens/${tokenAddress}`, {
      headers: getBagsHeaders(options?.apiKey),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch token info');
    }
    
    const data = await response.json();
    
    return {
      address: tokenAddress,
      name: data.name,
      symbol: data.symbol,
      description: data.description,
      image: data.image,
      creator: data.creator,
      marketCap: data.marketCap,
      price: data.price,
      volume24h: data.volume24h,
      bondingCurveProgress: data.bondingCurveProgress,
      migrated: data.migrated,
      createdAt: data.createdAt,
    };
  },

  /**
   * Check if token is ready for migration
   */
  async checkMigration(
    tokenAddress: string,
    options?: BagsApiOptions
  ): Promise<MigrationCheckResult> {
    const response = await fetch(`${BAGS_API_BASE}/tokens/${tokenAddress}`, {
      headers: getBagsHeaders(options?.apiKey),
    });
    
    if (!response.ok) {
      throw new Error('Failed to check migration status');
    }
    
    const data = await response.json();
    const progress = data.bondingCurveProgress || 0;
    const migrated = data.migrated || false;
    
    return {
      tokenAddress,
      ready: progress >= 100 && !migrated,
      alreadyMigrated: migrated,
      progress,
      remainingProgress: Math.max(0, 100 - progress),
      marketCap: data.marketCap,
      estimatedLiquidityPool: data.estimatedLiquidityPool || null,
      message: migrated 
        ? 'Token already migrated to liquidity pool'
        : progress >= 100
          ? 'Token is ready for migration!'
          : `${(100 - progress).toFixed(2)}% remaining to complete bonding curve`,
    };
  },

  /**
   * Get trending tokens
   */
  async getTrending(
    limit: number = 10,
    options?: BagsApiOptions
  ): Promise<TokenLaunchInfo[]> {
    const response = await fetch(
      `${BAGS_API_BASE}/tokens/trending?limit=${limit}`,
      { headers: getBagsHeaders(options?.apiKey) }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch trending tokens');
    }
    
    const data = await response.json();
    return data.tokens || [];
  },

  /**
   * Calculate token price on bonding curve
   */
  async calculatePrice(
    tokenAddress: string,
    amount: number,
    options?: BagsApiOptions
  ): Promise<{
    inputAmount: number;
    outputAmount: number;
    pricePerToken: number;
    priceImpact: number;
    fees: number;
  }> {
    const response = await fetch(
      `${BAGS_API_BASE}/tokens/${tokenAddress}/quote?amount=${amount}`,
      { headers: getBagsHeaders(options?.apiKey) }
    );
    
    if (!response.ok) {
      throw new Error('Failed to calculate price');
    }
    
    const data = await response.json();
    
    return {
      inputAmount: amount,
      outputAmount: data.outputAmount,
      pricePerToken: data.pricePerToken,
      priceImpact: data.priceImpact,
      fees: data.fees,
    };
  },
};

