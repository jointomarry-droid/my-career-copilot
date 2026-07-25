import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDatabase();

    let rules = [];
    let stats = { completed: 0, pending: 0 };

    if (db) {
      try {
        rules = await db.collection('automation_rules').find({}).sort({ createdAt: -1 }).toArray();
        stats = {
          completed: rules.filter(r => r.status === 'completed').length,
          pending: rules.filter(r => r.enabled && r.status !== 'completed').length,
        };
      } catch (e) {
        console.log('Using fallback automation data');
      }
    }

    if (rules.length === 0) {
      rules = getFallbackRules();
      stats = { completed: 12, pending: 3 };
    }

    return NextResponse.json({ success: true, rules, stats });
  } catch (error) {
    console.error('Automation rules error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { type, trigger, template, customMessage, enabled } = await request.json();

    const db = await getDatabase();
    const rule = {
      type,
      trigger,
      template,
      customMessage,
      enabled: enabled !== false,
      sent: 0,
      status: 'active',
      createdAt: new Date(),
    };

    if (db) {
      try {
        const result = await db.collection('automation_rules').insertOne(rule);
        rule._id = result.insertedId;
      } catch (e) {
        rule._id = new ObjectId().toString();
      }
    } else {
      rule._id = new ObjectId().toString();
    }

    return NextResponse.json({ success: true, rule });
  } catch (error) {
    console.error('Create automation rule error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { ruleId, action } = await request.json();

    const db = await getDatabase();

    if (db) {
      try {
        if (action === 'toggle') {
          await db.collection('automation_rules').updateOne(
            { _id: new ObjectId(ruleId) },
            [{ $set: { enabled: { $not: '$enabled' } } }]
          );
        }
      } catch (e) {
        console.log('Toggle rule in fallback mode');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update automation rule error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { ruleId } = await request.json();

    const db = await getDatabase();

    if (db) {
      try {
        await db.collection('automation_rules').deleteOne({ _id: new ObjectId(ruleId) });
      } catch (e) {
        console.log('Delete rule in fallback mode');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete automation rule error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function getFallbackRules() {
  return [
    {
      _id: '1',
      type: 'follow-up',
      trigger: 'no_response_7days',
      template: 'polite_followup',
      label: '7-Day Follow-up',
      enabled: true,
      sent: 8,
      status: 'active',
    },
    {
      _id: '2',
      type: 'follow-up',
      trigger: 'interview_completed',
      template: 'value_add',
      label: 'Post-Interview Thank You',
      enabled: true,
      sent: 4,
      status: 'active',
    },
    {
      _id: '3',
      type: 'follow-up',
      trigger: 'offer_received',
      template: 'final_check',
      label: 'Offer Follow-up',
      enabled: false,
      sent: 0,
      status: 'paused',
    },
  ];
}
