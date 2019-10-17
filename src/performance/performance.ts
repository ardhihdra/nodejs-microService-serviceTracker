import { bus } from "../lib/bus";
import { DriverPoint } from './orm';
import { Request, Response } from "express";
import { createTracer } from "../lib/tracer";
import { FORMAT_HTTP_HEADERS } from "opentracing";

const tracer = createTracer("performance-service");

interface Movement {
    rider_id: number;
    north: number;
    west: number;
    east: number;
    south: number;
}

async function pointUpdater(movement: Movement) {
    const { rider_id, north, south, east, west } = movement;

    const [position, created] = await DriverPoint.findOrCreate({
        // update driver point
        defaults: {
            point: 0
        },
        where: {
            rider_id
        }
    });

    // update latitude & longitude
    let point = parseFloat(position.get("point") as string);
    point += calcDisplacement(north, south, east, west);
    console.log(`update point ${point}`);
    try {
        await position.update({
            point
        });
    } catch (err) {
        console.error(err);
    }
}

function calcDisplacement(n: number, s: number, e: number, w: number): number {
    n = parseFloat(n.toString());
    s = parseFloat(s.toString());
    w = parseFloat(w.toString());
    e = parseFloat(e.toString());
    const result = Math.sqrt(Math.pow((n - s), 2) + Math.pow((w - e), 2));
    return result;
}

export function positionProjector(): number {
    return bus.subscribe("rider.moved", (movement: Movement) => {
        pointUpdater(movement);
    });
}


// handle route get point 
export async function getRiderPerformance(req: Request, res: Response) {
    const httpSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
    const parentSpan = tracer.startSpan("get_point", {
        childOf: httpSpan
    })

    const span = tracer.startSpan("parsing_input", { childOf: parentSpan });

    const id = req.params.rider_id;
    if (!id) {
        span.setTag("error", true);
        span.log({
            event: "error parsing",
            message: "parameter tidak lengkap"
        });
        res.sendStatus(400).json({
            ok: false,
            error: "parameter tidak lengkap"
        });
        span.finish();
        parentSpan.finish();
        return;
    }

    // get rider point
    const span2 = tracer.startSpan("read_point_on_db", {
        childOf: parentSpan
    });
    // const [result, created] = await DriverPoint.findOrCreate({
    //     defaults: { point: 0 },
    //     where: { rider_id: id }
    // });

    // const point = result.get("point");
    let result: DriverPoint;
    try {
        result = await DriverPoint.findOne({
            where: { rider_id: id }
        });
    } catch (err) {
        span.setTag("error", true);
        span.log({
            event: "error read point db",
            message: err.toString()
        });
        res.status(500).json({
            ok: false,
            message: "gagal menyimpan data"
        });
        return;
    }
    span2.finish();

    const span3 = tracer.startSpan("encode_result", {
        childOf: parentSpan
    });
    res.json({
        ok: true, point: result.get("point")
    });
    span3.finish();
    parentSpan.finish();
}