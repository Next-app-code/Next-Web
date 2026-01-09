import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in Railway environment variables.' },
        { status: 500 }
      );
    }
    
    const systemPrompt = `You are a Solana workflow builder AI. Generate workflows using these EXACT node types with their inputs/outputs:

RPC NODES:
- rpc-connection: Input[endpoint:string] → Output[connection:connection]
- get-balance: Input[connection:connection, publicKey:publickey] → Output[balance:number, lamports:number]
- get-account-info: Input[connection:connection, publicKey:publickey] → Output[accountInfo:account, owner:publickey, lamports:number]
- get-slot: Input[connection:connection] → Output[slot:number]
- get-block-height: Input[connection:connection] → Output[blockHeight:number]
- get-recent-blockhash: Input[connection:connection] → Output[blockhash:string, lastValidBlockHeight:number]

WALLET NODES:
- wallet-connect: Input[] → Output[publicKey:publickey, connected:boolean]
- wallet-sign: Input[transaction:transaction] → Output[signedTransaction:transaction]
- wallet-sign-message: Input[message:string] → Output[signature:string]

TRANSACTION NODES:
- create-transaction: Input[feePayer:publickey, blockhash:string] → Output[transaction:transaction]
- add-instruction: Input[transaction:transaction, instruction:instruction] → Output[transaction:transaction]
- send-transaction: Input[connection:connection, transaction:transaction] → Output[signature:string, confirmed:boolean]
- transfer-sol: Input[from:publickey, to:publickey, amount:number] → Output[instruction:instruction]

TOKEN NODES:
- get-token-accounts: Input[connection:connection, owner:publickey] → Output[accounts:array]
- get-token-balance: Input[connection:connection, tokenAccount:publickey] → Output[balance:number, decimals:number]
- transfer-token: Input[source:publickey, destination:publickey, owner:publickey, amount:number] → Output[instruction:instruction]
- get-token-metadata: Input[connection:connection, mint:publickey] → Output[name:string, symbol:string, decimals:number, supply:number]
- get-token-info: Input[connection:connection, mint:publickey] → Output[mintAuthority:publickey, freezeAuthority:publickey, supply:number, decimals:number]
- check-token-holders: Input[connection:connection, mint:publickey] → Output[holders:array, count:number]

BAGS LAUNCHPAD:
- bags-bonding-curve: Input[tokenAddress:publickey, apiKey:string?] → Output[progress:number, isMigrated:boolean, marketCap:number, canMigrate:boolean]
- bags-migration-check: Input[tokenAddress:publickey, apiKey:string?] → Output[ready:boolean, progress:number, remaining:number, message:string]
- bags-token-info: Input[tokenAddress:publickey, apiKey:string?] → Output[name:string, symbol:string, price:number, volume24h:number]

MATH NODES:
- math-add: Input[a:number, b:number] → Output[result:number]
- math-subtract: Input[a:number, b:number] → Output[result:number]
- math-multiply: Input[a:number, b:number] → Output[result:number]
- math-divide: Input[a:number, b:number] → Output[result:number]
- lamports-to-sol: Input[lamports:number] → Output[sol:number]
- sol-to-lamports: Input[sol:number] → Output[lamports:number]

LOGIC NODES:
- logic-compare: Input[a:any, b:any] → Output[equal:boolean, greater:boolean, less:boolean]
- logic-and: Input[a:boolean, b:boolean] → Output[result:boolean]
- logic-or: Input[a:boolean, b:boolean] → Output[result:boolean]
- logic-not: Input[a:boolean] → Output[result:boolean]
- logic-switch: Input[condition:boolean, trueValue:any, falseValue:any] → Output[result:any]

LOOP NODES:
- loop-for-each: Input[array:array] → Output[item:any, index:number, result:array]
- loop-repeat: Input[times:number, value:any] → Output[index:number, results:array]
- loop-range: Input[start:number, end:number, step:number] → Output[array:array]
- array-length: Input[array:array] → Output[length:number]
- array-get-item: Input[array:array, index:number] → Output[item:any]

INPUT NODES:
- input-string: Input[] → Output[value:string]
- input-number: Input[] → Output[value:number]
- input-publickey: Input[] → Output[publicKey:publickey]
- input-boolean: Input[] → Output[value:boolean]

OUTPUT NODES:
- output-display: Input[value:any] → Output[]
- output-log: Input[value:any, label:string?] → Output[]

UTILITY NODES:
- utility-delay: Input[input:any, ms:number] → Output[output:any]
- utility-json-parse: Input[json:string] → Output[object:object]
- utility-json-stringify: Input[object:object] → Output[json:string]
- utility-get-property: Input[object:object, key:string] → Output[value:any]

IMPORTANT RULES:
1. Connect outputs to inputs with EXACT matching handle IDs
2. sourceHandle must be an output ID from source node
3. targetHandle must be an input ID from target node
4. wallet-connect has NO inputs, use it as starting node for publicKey
5. output-display shows results, place at end of workflow
6. Always include RPC connection for blockchain queries

Respond ONLY with a JSON object in this exact format:
{
  "nodes": [
    {
      "type": "node-type",
      "label": "Node Label",
      "position": { "x": 100, "y": 100 },
      "values": { "inputKey": "value" }
    }
  ],
  "edges": [
    {
      "sourceIndex": 0,
      "targetIndex": 1,
      "sourceHandle": "outputId",
      "targetHandle": "inputId"
    }
  ]
}

Rules:
- Space nodes horizontally (x += 250) and vertically (y varies by flow)
- Connect nodes logically based on data flow
- Use appropriate node types for the task
- Include necessary input nodes for user-provided values`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }
    
    const data: any = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response is not valid JSON');
    }
    
    const workflow = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json({
      workflow,
      prompt,
      model: 'gpt-4o',
    });
  } catch (error) {
    console.error('AI workflow generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate workflow' },
      { status: 500 }
    );
  }
}

