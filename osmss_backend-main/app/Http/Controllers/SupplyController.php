<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Models\Supply;
use App\Models\SupplyHistory;
use App\Models\User;

class SupplyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $supplies = Supply::all();
            return response()->json([
                'message' => 'Supplies retrieved successfully',
                'supplies' => $supplies
            ]);
        }catch(\Exception $e){
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try{
            $validator = Validator::make($request->all(), [
                'name' => 'required',
                'quantity' => 'required',
                'price' => 'required',
                'supplier' => 'required',
            ]);
        }catch(\Exception $e){
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
    public function createItem(Request $request)
    {
        try{
            $validator = Validator::make($request->all(), [
                'name' => 'required',
                'pieces' => 'required',
                'unit' => 'required',
                'status' => 'required',
            ]);
            if($validator->fails()){
                return response()->json(['message' => $validator->errors()->first()], 400);
            }
            $supply = new Supply();
            $supply->name = $request->name;
            $supply->pieces = $request->pieces;
            $supply->unit = $request->unit;
            $supply->status = $request->status;
            $supply->save();
            return response()->json([
                'message' => 'Item added successfully',
                'item' => $supply
            ]);
        }catch(\Exception $e){
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function updateItem(Request $request, $id)
    {
        try{
            $validator = Validator::make($request->all(), [
                'pieces' => 'required',
                'status' => 'required',
                'action' => 'required',
                'reason' => 'required',
                'box' => 'required',
                'userID' => 'required',
            ]);
            // $user = auth()->user();
            $user = User::find($request->userID);
            if($validator->fails()){
                return response()->json(['message' => $validator->errors()->first()], 400);
            }
            $supply = Supply::find($id);
            $history = new SupplyHistory();
            if(!$supply){
                return response()->json(['message' => 'Item not found'], 404);
            }
            $supply->pieces = $request->pieces;
            $supply->status = $request->status;
            $supply->box = $request->box;
            $supply->save();

            $history->releaser = $user->firstname . ' ' . $user->lastname;
            $history->action = $request->action;
            $history->reason = $request->reason;
            $history->name = $supply->name;
            $history->pieces = $request->pieces;
            $history->save();
            return response()->json([
                'message' => 'Item updated successfully',
                'item' => $supply
            ]);
        }catch(\Exception $e){
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function lowstockReport(Request $request)
{
    try {
        // {
        //     "startDate": "2025-03-01",
        //     "endDate": "2025-03-25",
        //      "threshold": 24
        // }
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:startDate',
            'threshold' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 400);
        }

        $supplies = SupplyHistory::where('pieces', '<=', $request->threshold)
            ->whereBetween('updated_at', [$request->start_date, $request->end_date])
            ->get();
        $data = [];
        foreach ($supplies as $supply) {
            $date = explode(' ',explode('T', $supply->updated_at)[0])[0];

            $data[$date][] = [
                $supply->name , $supply->pieces,
            ];
        }
       
        return response()->json([
            'message' => 'Low stock report',
            'supplies' => $data
        ]);
    } catch (\Exception $e) {
        return response()->json(['message' => $e->getMessage()], 500);
    }
}
    public function getName(Request $request){
        try{
            $supplies = Supply::all();
            $name = [];
            foreach($supplies as $sup){
                $name[$sup->name] = $sup->name;
            }
            $names = [];
            foreach($name as $n=>$key){
                $names[] = $key;
            }
            return response()->json([
                "message" => "success",
                "names" => $names ]);
        }catch(\Exception $e){
            return response()->json(["message" =>$e->getMessage()],500);
        }
    }
    public function stockMovementReport(Request $request)
    {
        try {
            // {
            //     "startDate": "2025-03-01",
            //     "endDate": "2025-03-25",
            //     "item" : "Ballpoint Pens"
            // }
            $validator = Validator::make($request->all(), [
                'startDate' => 'required|date',
                'endDate' => 'required|date|after_or_equal:startDate',
                'item' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => $validator->errors()->first()], 400);
            }

            // $supplies = SupplyHistory::where('name',$request->item)
            //     ->where('pieces', '>', 24)
            //     ->whereBetween('updated_at', [$request->startDate, $request->endDate])
            //     ->get();
            // $supplies = SupplyHistory::where('pieces', '>', 24)
            // ->whereBetween('updated_at', [$request->startDate, $request->endDate])
            // ->get();

            $stock_in = SupplyHistory::where('action', 'Stock In')
                    ->whereBetween('updated_at', [$request->startDate, $request->endDate])
                    ->get();
            $stock_out = SupplyHistory::where('action', 'Stock Out')
            ->whereBetween('updated_at', [$request->startDate, $request->endDate])
            ->get();
            
            $data = [];
            foreach($stock_in as $item){
                $date = explode(' ',explode('T', $item->updated_at)[0])[0];
                if(array_key_exists($date,$data)){
                    $data[$date] = [
                        'Stock In' => $data[$date]['Stock In'] + $item->pieces,
                        'Stock Out' => 0
                    ];
                }else{
                    $data[$date] = [
                        'Stock In' => $item->pieces,
                        'Stock Out' => 0
                    ];
                }
            }
            foreach($stock_out as $item){
                $date = explode(' ',explode('T', $item->updated_at)[0])[0];
                if(array_key_exists($date,$data)){
                    $data[$date] = [
                        'Stock In' => $data[$date]['Stock In'],
                        'Stock Out' => $data[$date]['Stock Out'] + $item->pieces
                    ];
                }else{
                    $data[$date] = [
                        'Stock In' => 0,
                        'Stock Out' => $item->pieces
                    ];
                }
            }
            // foreach ($supplies as $supply) {
            //     $date = explode(' ',explode('T', $supply->updated_at)[0])[0];
            //     $data[$date] = $supply->pieces;
                
            // }
            return response()->json([
                'message' => 'Stock movement report',
                'records' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
