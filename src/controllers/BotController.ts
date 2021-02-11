import { Request, Response } from "express";
import { Controller, Post } from "@overnightjs/core";
import { Logger } from "@overnightjs/logger";
import { runQuery } from "../utils/dialogflow";

@Controller("api/bot")
export class BotController {
  @Post()
  private postMessage(request: Request, response: Response) {
    // we have to set headers for CORS; in production * has to be changed to the actual domain the requests come from 
    response.setHeader('Access-Control-Allow-Origin', '*');
    // Here we get the message body, the id to which we're sending the message and where it comes from.
    request.body.Language_Code = request.body.Language_Code || 'de-DE';
    const { Body, Language_Code } = request.body;
    // Here we're sending the received message to Dialogflow (dialogflow.ts) so that it can be identified against an Intent.
    runQuery(Body, Language_Code)
      .then((result: any) => {
      // Now the fulfillment text has to make its way back to the frontend
      const message = {  
        message: { 
          Body: result.fulfillmentMessages
        }
      }  
      return response.status(200).json(message); 
      })
      .catch((error) => {
        console.error("error is ", error);
        Logger.Err(error);
      });
      
  }
}
