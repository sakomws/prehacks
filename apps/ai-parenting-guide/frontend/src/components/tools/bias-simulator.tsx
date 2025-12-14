"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BiasSimulator() {
    const [maleRepresentation, setMaleRepresentation] = useState([80])
    const [femaleRepresentation, setFemaleRepresentation] = useState([20])
    const [hiringBias, setHiringBias] = useState(0)

    // Logic: AI bias mirrors training data bias
    useEffect(() => {
        // If training data is 80% male, AI will likely recommend males 80% of the time + amplification
        const bias = (maleRepresentation[0] - 50) * 1.5
        setHiringBias(Math.min(100, Math.max(-100, bias)))
        setFemaleRepresentation([100 - maleRepresentation[0]])
    }, [maleRepresentation])

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Training Data Composition</CardTitle>
                    <CardDescription>
                        Adjust the demographics of the data used to train the "Hiring AI".
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>Tech Executive Profiles (Male)</Label>
                            <span className="font-mono text-muted-foreground">{maleRepresentation}%</span>
                        </div>
                        <Slider
                            value={maleRepresentation}
                            onValueChange={(val) => {
                                setMaleRepresentation(val)
                            }}
                            min={0}
                            max={100}
                            step={1}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>Tech Executive Profiles (Female)</Label>
                            <span className="font-mono text-muted-foreground">{femaleRepresentation}%</span>
                        </div>
                        <Progress value={femaleRepresentation[0]} className="h-2" />
                    </div>

                    <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground flex gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                        <p>
                            Note: The dataset contains historic hiring data from the last 10 years, which reflects past societal imbalances.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-950 text-white border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        AI Model Output
                        <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">v1.0.0</Badge>
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Automated candidate screening results based on your training data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Likelihood to Recommend: Male</span>
                            <span className={hiringBias > 20 ? "text-red-400 font-bold" : "text-green-400"}>
                                {Math.min(100, 50 + hiringBias / 2).toFixed(1)}%
                            </span>
                        </div>
                        <Progress
                            value={50 + hiringBias / 2}
                            className={`h-4 ${hiringBias > 20 ? "bg-slate-800 [&>div]:bg-red-500" : "bg-slate-800 [&>div]:bg-green-500"}`}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Likelihood to Recommend: Female</span>
                            <span className={hiringBias > 20 ? "text-red-400 font-bold" : "text-green-400"}>
                                {Math.max(0, 50 - hiringBias / 2).toFixed(1)}%
                            </span>
                        </div>
                        <Progress
                            value={50 - hiringBias / 2}
                            className={`h-4 ${hiringBias > 20 ? "bg-slate-800 [&>div]:bg-red-500" : "bg-slate-800 [&>div]:bg-green-500"}`}
                        />
                    </div>

                    <div className="mt-8 p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                            {hiringBias > 20 ? (
                                <AlertCircle className="text-red-500 h-5 w-5" />
                            ) : (
                                <CheckCircle2 className="text-green-500 h-5 w-5" />
                            )}
                            Analysis
                        </h4>
                        <p className="text-sm text-slate-300">
                            {hiringBias > 20
                                ? "The AI has learned to strongly favor male candidates, amplifying the imbalance present in the training data. This is an example of algorithmic bias."
                                : "The AI is producing relatively balanced recommendations, though it may still struggle with edge cases."
                            }
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full text-slate-800 dark:text-slate-200 border-slate-700 hover:bg-slate-800"
                        onClick={() => setMaleRepresentation([50])}
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Reset to Balanced Data
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
