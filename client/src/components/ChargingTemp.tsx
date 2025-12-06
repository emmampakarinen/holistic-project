export function ChargingTemp () => {
    return ({/* Temperature Warning */}
            <Card className="bg-warning/10 border-0">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-warning/20 p-2 rounded-lg">
                    <Thermometer className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Current Temperature</h3>
                    <p className="text-3xl font-bold text-warning mb-1">
                      {tripPlan?.temperature ??
                        activeChargingSessionData.temperature}
                      °C
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Auto-detected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>) 
}