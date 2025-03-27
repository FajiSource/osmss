<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    //
    public function login(Request $request){
        try{
            $validator = Validator::make($request->all(),[
                "username" => 'required',
                "password" => 'required'
            ]);
            if($validator->fails()){
                return response()->json(["message" => $validator->errors()->first()], 400);
            }
            $user = User::where("username", $request->username)->first();
            if(!$user || !Hash::check($request->password,$user->password)){
                return response()->json(["message" => "The provided credentials are incorrect"],401 );
            }
            $token = $user->createToken($user->username . 'Auth-Token')->plainTextToken;
            return response()->json([
                "message" => "Login Succesfull",
                "user" => $user,
                "token" => $token
            ]);
        }catch(\Exception $e){
            return response()->json(["message" => $e->getMessage()], 500);
        }
    }
}
