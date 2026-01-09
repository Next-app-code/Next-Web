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
    
    const systemPrompt = `You are a Solana workflow builder AI. Given a user's request, generate a workflow using the available node types.

Available node types and their purposes:
- rpc-connection: Connect to Solana RPC
- get-balance: Get SOL balance of an account
- wallet-connect: Get connected wallet's public key
- get-token-accounts: Get token accounts for an owner
- get-token-balance: Get balance of specific token
- transfer-sol: Create SOL transfer instruction
- create-transaction: Create new transaction
- send-transaction: Send transaction to blockchain
- math-add/subtract/multiply/divide: Math operations
- lamports-to-sol, sol-to-lamports: Conversions
- logic-compare, logic-switch: Logic operations
- input-string, input-number, input-publickey: Input values
- output-display: Display results
- bags-bonding-curve: Check Bags.fm bonding curve
- bags-migration-check: Check migration readiness
- bags-token-info: Get Bags token info

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

